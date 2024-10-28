import * as core from '@actions/core'
import {Octokit} from '@octokit/rest'
import axios from 'axios'
import moment from 'moment-timezone'
import {createMessageCard, createAdaptiveCard} from './message-card'

const escapeMarkdownTokens = (text: string) =>
  text
    .replace(/\n\ {1,}/g, '\n ')
    .replace(/\_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\|/g, '\\|')
    .replace(/#/g, '\\#')
    .replace(/-/g, '\\-')
    .replace(/>/g, '\\>')

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github-token', {required: true})
    const msTeamsWebhookUri: string = core.getInput('ms-teams-webhook-uri', {
      required: true
    })

    const notificationSummary =
      core.getInput('notification-summary') || 'GitHub Action Notification'

    const subMessage = core.getInput('notification-sub-message') || ''

    const notificationColor = core.getInput('notification-color') || '0b93ff'
    const timezone = core.getInput('timezone') || 'UTC'

    const timestamp = moment()
      .tz(timezone)
      .format('dddd, MMMM Do YYYY, h:mm:ss a z')

    const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/')
    const sha = process.env.GITHUB_SHA || ''
    const runId = process.env.GITHUB_RUN_ID || ''
    const runNum = process.env.GITHUB_RUN_NUMBER || ''
    const params = {owner, repo, ref: sha}
    const repoName = params.owner + '/' + params.repo
    const repoUrl = `https://github.com/${repoName}`

    const octokit = new Octokit({auth: `token ${githubToken}`})
    const commit = await octokit.repos.getCommit(params)
    const author = commit.data.author

    const useAdaptiveCard: boolean =
      core.getInput('adaptive-card-message') === 'true'
    console.log('useAdaptiveCard', useAdaptiveCard)

    let messageCard

    if (useAdaptiveCard) {
      messageCard = await createAdaptiveCard(
        notificationSummary,
        commit,
        runId,
        repoUrl
      )
    } else {
      messageCard = await createMessageCard(
        notificationSummary,
        notificationColor,
        commit,
        author,
        runNum,
        runId,
        repoName,
        sha,
        repoUrl,
        timestamp,
        subMessage
      )
    }

    console.log(messageCard)

    axios
      .post(msTeamsWebhookUri, messageCard)
      .then(function (response) {
        console.log(response)
        core.debug(response.data)
      })
      .catch(function (error) {
        core.debug(error)
      })
  } catch (error) {
    console.log(error)
    core.setFailed((error as Error).message)
  }
}

run()
