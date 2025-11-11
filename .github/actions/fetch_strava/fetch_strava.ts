import { writeFileSync } from 'fs';
import { Octokit } from 'octokit';
import strava, { DetailedActivityResponse } from 'strava-v3';
import sodium from 'libsodium-wrappers';

import dotenv from 'dotenv';
dotenv.config();

// Pull my auth token from GH secrets (or .env)
const load_auth_token = () => {
    console.log("Loading strava auth token");
    const auth_token = JSON.parse(process.env.STRAVA_AUTH_TOKEN!);
    return auth_token;
}

// Test token refresh to see if a new token is needed
const refresh_auth_token = async (token: any) => {
    console.log("Refreshing strava auth token");
    let tmp_token = token;
    console.log("Getting new refresh token")
    const new_token = await strava.oauth.refreshToken(token.refresh_token);
    console.log("New refresh token received")
    tmp_token.access_token = new_token.access_token;
    tmp_token.refresh_token = new_token.refresh_token;
    tmp_token.expires_at = new_token.expires_at;
    if (tmp_token.access_token === undefined || tmp_token.refresh_token === undefined || tmp_token.expires_at === undefined || tmp_token.athlete === undefined) {
        return token;
    } else {
        return tmp_token;
    }
}

// Update the auth token in the GH secrets if a new token is received
const update_auth_token = async (token: any) => {
    console.log("Updating strava auth token in GitHub secrets");
    // Connect to GitHub API
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });
    console.log("Token len: "+process.env.GITHUB_TOKEN?.length);
    try {
        const user = await octokit.rest.users.getAuthenticated();
        console.log("Authenticated as: " + user.data.login);
    } catch (error) {
        console.error("Failed to authenticate with GitHub API:", error);
        throw error;
    }
    // Write tokens to JSON
    const token_json = JSON.stringify(token);
    // Get public key
    console.log("Getting repo public key")
    const pubkey = await octokit.request('GET /repos/{owner}/{repo}/actions/secrets/public-key', {
        owner: (process.env.GITHUB_REPOSITORY!).split('/')[0],
        repo: (process.env.GITHUB_REPOSITORY!).split('/')[1],
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    // Encrypt token
    console.log("Encrypting tokens")
    const keybin = sodium.from_base64(pubkey.data.key, sodium.base64_variants.ORIGINAL);
    const secretbin = sodium.from_string(token_json);
    const encrypted_secret = sodium.crypto_box_seal(secretbin, keybin);
    const encrypted_secret_b64 = sodium.to_base64(encrypted_secret, sodium.base64_variants.ORIGINAL);
    // Update secret contents
    console.log("Updating auth secret")
    await octokit.request('PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}', {
        owner: process.env.GITHUB_REPOSITORY!.split('/')[0],
        repo: process.env.GITHUB_REPOSITORY!.split('/')[1],
        secret_name: 'STRAVA_AUTH_TOKEN',
        encrypted_value: encrypted_secret_b64,
        key_id: pubkey.data.key_id,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
}

// Simplify date to day
const time_to_day = (time: Date) => {
    let date = new Date(time);
    let day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return day;
}

// Compile workout data into calendar format
const compile_activities = (workouts: any[]) => {
    console.log("Compiling workout data")
    let workout_list = workouts;
    let active_days: Date[] = [];
    workout_list.forEach((workout) => {
        let active_day = time_to_day(workout.start_date_local);
        if (active_days.findIndex((d) => d.valueOf()==active_day.valueOf())==-1) active_days.push(active_day);
    });
    let workout_calendar: any[] = [];
    active_days.forEach((day) => {
        let today = workout_list.filter((workout) => (time_to_day(workout.start_date_local).valueOf() == day.valueOf()));
        let date = day.toISOString().split('T')[0];
        let daily_runs = today.filter((workout) => (workout.sport_type.includes("Run")));
        let run_dist = daily_runs.reduce((acc, workout) => acc + workout.distance, 0)*0.0006213712;
        let run_time = daily_runs.reduce((acc, workout) => acc + workout.elapsed_time, 0)/60.;
        let daily_hikes = today.filter((workout) => (workout.sport_type.includes("Hike")));
        let hike_dist = daily_hikes.reduce((acc, workout) => acc + workout.distance, 0)*0.0006213712;
        let hike_time = daily_hikes.reduce((acc, workout) => acc + workout.elapsed_time, 0)/60.;
        let daily_bikes = today.filter((workout) => (workout.sport_type.includes("Ride")));
        let bike_dist = daily_bikes.reduce((acc, workout) => acc + workout.distance, 0)*0.0006213712;
        let bike_time = daily_bikes.reduce((acc, workout) => acc + workout.elapsed_time, 0)/60.;
        let daily_swims = today.filter((workout) => (workout.sport_type.includes("Swim")));
        let swim_dist = daily_swims.reduce((acc, workout) => acc + workout.distance, 0)*1.0936132983;
        let swim_time = daily_swims.reduce((acc, workout) => acc + workout.elapsed_time, 0)/60.;
        let n_activities = daily_runs.length + daily_hikes.length + daily_bikes.length + daily_swims.length;
        let total_time = run_time + hike_time + bike_time + swim_time;
        let activity = {date: date, count: n_activities, run: run_dist, hike: hike_dist, bike: bike_dist, swim: swim_dist, time: total_time}
        if (n_activities>0) workout_calendar.push(activity);
    });
    let max_time = Math.max(...workout_calendar.map((day) => day.time));
    workout_calendar.map((day) => {
        let new_day = day;
        new_day.level = day.time==0?0:Math.floor(day.time/max_time*3)+1;
        return new_day;
    });
    if (workout_calendar.length!=0 && workout_calendar[0].date!=(new Date().getFullYear().toString()+"-01-01")) {
        workout_calendar.push({date: new Date().getFullYear().toString()+"-01-01", count: 0, run: 0, hike: 0, bike: 0, swim: 0, time: 0, level: 0})
    }
    if (workout_calendar.length!=0 && workout_calendar[0].date!=(new Date().getFullYear().toString()+"-12-31")) {
        workout_calendar.push({date: new Date().getFullYear().toString()+"-12-31", count: 0, run: 0, hike: 0, bike: 0, swim: 0, time: 0, level: 0})
    }
    return workout_calendar;
}

const write_activity_data = (data: any) => {
    console.log("Saving to JSON");
    const data_json = JSON.stringify(data);
    writeFileSync(process.env.OUT_FILE!, data_json, {flag: 'w'});
}

const fetch_strava_data = async () => {
    let auth_token = load_auth_token();
    strava.config({
        access_token: auth_token.access_token,
        client_id: process.env.STRAVA_CLIENT_ID!,
        client_secret: process.env.STRAVA_CLIENT_SECRET!,
        redirect_uri: 'http://localhost'
    });
    if (auth_token.expires_at < Math.ceil(Date.now()/1000)) {
        const new_token = await refresh_auth_token(auth_token);
        await update_auth_token(new_token);
        auth_token = new_token;
    }
    strava.config({
        access_token: auth_token.access_token,
        client_id: process.env.STRAVA_CLIENT_ID!,
        client_secret: process.env.STRAVA_CLIENT_SECRET!,
        redirect_uri: 'http://localhost'
    });
    const year_start = Math.floor(new Date(new Date().getFullYear(), 0, 1).valueOf()/1000);
    let workouts: DetailedActivityResponse[] = [];
    let page = 1
    console.log("Collecting workout data")
    while (true) {
        console.log("Fetching workouts from pg"+page.toString())
        const data = await strava.athlete.listActivities({after: year_start, per_page: 200, page: page, access_token: auth_token.access_token}) as DetailedActivityResponse[];
        if (data.length === 0) break;
        workouts = workouts.concat(data);
        ++page;
    }
    let workout_calendar = compile_activities(workouts);
    console.log("Writing workouts to file (JSON)")
    write_activity_data(workout_calendar);
}

fetch_strava_data();