import { writeFileSync } from 'fs';
import { Octokit } from 'octokit';

interface CommitResult {
    user: {
        contributionsCollection: {
            contributionCalendar: {
                totalContributions: number,
                weeks: {
                    contributionDays: {
                        contributionCount: number,
                        date: string
                    }[]
                }[]
            }
        }
    }
}

const fetch_github = async () => {
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

    const commit_data = await octokit.graphql(`query {
        user(login: "alexdhill") {
            contributionsCollection {
                contributionCalendar {
                    weeks {
                        contributionDays {
                            contributionCount
                            date
                        }
                    }
                }
            }
        }
    }`) as CommitResult;

    let commit_cal: any[] = [];
    commit_data!.user.contributionsCollection.contributionCalendar.weeks.forEach(week => {
        week.contributionDays.forEach(day => {
            if (new Date(day.date).getFullYear() === new Date().getFullYear())
            {
                commit_cal.push({
                    date: day.date,
                    count: day.contributionCount
                });
            }
        });
    });

    const max_count = Math.max(...commit_cal.map((day) => day.count));
    commit_cal = commit_cal.map((date) => {
        var new_date = date
        new_date.level = new_date.count==0?0:Math.floor(new_date.count / max_count * 3)+1;
        return new_date;
    });

    if (commit_cal.length!=0 && commit_cal[0].date!=(new Date().getFullYear().toString()+"-01-01")) {
        commit_cal.push({date: new Date().getFullYear().toString()+"-01-01", count: 0, level: 0})
    }
    if (commit_cal.length!=0 && commit_cal[0].date!=(new Date().getFullYear().toString()+"-12-31")) {
        commit_cal.push({date: new Date().getFullYear().toString()+"-12-31", count: 0, level: 0})
    }
    commit_cal.sort((a, b) => {
        return new Date(a.date) < new Date(b.date) ? -1 : 1;
    });

    writeFileSync(process.env.OUT_FILE!, JSON.stringify(commit_cal));
}
fetch_github();