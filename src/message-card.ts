export function createMessageCard(
  notificationSummary: string,
  notificationColor: string,
  commit: any,
  author: any,
  runNum: string,
  runId: string,
  repoName: string,
  sha: string,
  repoUrl: string,
  timestamp: string,
  subMessage: string
): any {
  let avatar_url =
    'https://www.gravatar.com/avatar/05b6d8cc7c662bf81e01b39254f88a48?d=identicon'
  if (author) {
    if (author.avatar_url) {
      avatar_url = author.avatar_url
    }
  }
  const messageCard = {
    '@type': 'MessageCard',
    '@context': 'https://schema.org/extensions',
    summary: notificationSummary,
    themeColor: notificationColor,
    title: notificationSummary,
    sections: [
      {
        activityTitle: `**CI #${runNum} (commit ${sha.substr(
          0,
          7
        )})** on [${repoName}](${repoUrl})`,
        activityImage: avatar_url,
        activitySubtitle: `by ${commit.data.commit.author.name} [(@${
          author.login
        })](${author.html_url}) on ${timestamp} ${
          subMessage.length > 0 ? '\n deployed : ' + subMessage : ''
        }`
      }
    ],
    potentialAction: [
      {
        '@context': 'http://schema.org',
        target: [`${repoUrl}/actions/runs/${runId}`],
        '@type': 'ViewAction',
        name: 'View Workflow Run'
      },
      {
        '@context': 'http://schema.org',
        target: [commit.data.html_url],
        '@type': 'ViewAction',
        name: 'View Commit Changes'
      }
    ]
  }
  return messageCard
}

export function createAdaptiveCard(
  summary: string,
  description: string,
  commit: any,
  runId: string,
  repoUrl: string
): any {
  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.3',
          body: [
            {
              type: 'Container',
              items: [
                {
                  type: 'TextBlock',
                  size: 'Large',
                  weight: 'Bolder',
                  text: summary,
                  color: 'Attention',
                  horizontalAlignment: 'Left'
                },
                {
                  type: 'TextBlock',
                  text: description,
                  color: 'Attention',
                  horizontalAlignment: 'Left'
                }
              ]
            }
          ],
          msteams: {
            width: 'Full'
          },
          actions: [
            {
              type: 'Action.OpenUrl',
              title: 'View Workflow Run',
              url: `${repoUrl}/actions/runs/${runId}`
            },
            {
              type: 'Action.OpenUrl',
              title: 'View Commit Changes',
              url: commit.data.html_url
            }
          ]
        }
      }
    ],
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.3'
  }
}
