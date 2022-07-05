import * as core from '@actions/core';
import * as github from '@actions/github';

import {
  aliasPreviewUrl,
  generateAliasPreviewUrl,
  getDeployment,
  waitUntilDeployComplete,
} from './utils';

const run = async (): Promise<void> => {
  const { context } = github;
  let deployComplete = false;

  const vercel_access_token = core.getInput('vercel_access_token', {
    required: true,
  });
  const vercel_project_id = core.getInput('vercel_project_id', {
    required: true,
  });
  const vercel_team_id = core.getInput('vercel_team_id');
  const alias_template = core.getInput('alias_template');
  const interval = parseInt(core.getInput('interval'), 10) || 10000;

  /* Search Target Deployment */
  // pull_request: head.sha; push/merge: context.sha
  const commitSha: string =
    context.payload.pull_request?.head.sha || context.sha;
  const deployment = await getDeployment(commitSha, {
    vercel_team_id,
    vercel_project_id,
    vercel_access_token,
  });
  if (!deployment) {
    core.setFailed(`Unable to find Vercel deployment. sha: ${commitSha}`);
    return;
  }
  core.debug(
    `deployment url: ${deployment.url} - ${deployment.uid} - ${deployment.state}`,
  );
  if (deployment.state === 'READY') {
    deployComplete = true;
  }
  /* end of Search Target Deployment */

  /* wait until deployment finished by interval */
  if (!deployComplete) {
    const success = await waitUntilDeployComplete(deployment.url, interval, {
      vercel_team_id,
      vercel_access_token,
    });
    if (!success) {
      return;
    }
  }

  /* alias preview url */
  if (alias_template) {
    const aliasPreviewUrlGen = generateAliasPreviewUrl(alias_template);
    const aliasedPreviewUrl = await aliasPreviewUrl(
      deployment.uid,
      aliasPreviewUrlGen,
      {
        vercel_team_id,
        vercel_access_token,
      },
    );
    core.setOutput('preview_url_alias', aliasedPreviewUrl);
  }

  core.setOutput('preview_url_origin', deployment.url);
};

run().catch((error) => {
  if (error instanceof Error) {
    core.setFailed(error.message);
  }
});
