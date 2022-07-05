import { randomUUID } from 'crypto';

import * as core from '@actions/core';
import axios from 'axios';

import type { AssignAlias, DeploymentV13, DeploymentV6 } from './typings';

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function getDeployment(
  commitSha: string,
  searchOptions: {
    vercel_team_id: string;
    vercel_project_id: string;
    vercel_access_token: string;
  },
): Promise<DeploymentV6 | undefined> {
  const { deployments } = await axios
    .get<{ deployments?: DeploymentV6[] }>(
      'https://api.vercel.com/v6/deployments',
      {
        params: {
          teamId: searchOptions.vercel_team_id,
          projectId: searchOptions.vercel_project_id,
          limit: 20,
        },
        headers: {
          Authorization: `Bearer ${searchOptions.vercel_access_token}`,
        },
      },
    )
    .then(({ data }) => data);

  if (!deployments?.length) {
    return undefined;
  }

  // commitのshaでdeploymentを探す
  return deployments.find((dp: any) => dp.meta.githubCommitSha === commitSha);
}

export async function waitUntilDeployComplete(
  url: string,
  interval: number,
  searchOptions: {
    vercel_team_id: string;
    vercel_access_token: string;
  },
): Promise<boolean> {
  while (true) {
    core.debug(`Deployment not ready yet, waiting ${interval}ms -- ${url}`);
    await sleep(interval);
    const deployment = await axios
      .get<DeploymentV13>(`https://api.vercel.com/v13/deployments/${url}`, {
        params: {
          teamId: searchOptions.vercel_team_id,
        },
        headers: {
          Authorization: `Bearer ${searchOptions.vercel_access_token}`,
        },
      })
      .then(({ data }) => data);

    if (deployment.readyState === 'ERROR') {
      core.setFailed(`An error occurred while getting preview url`);
      return false;
    }
    if (deployment.readyState === 'CANCELED') {
      core.setFailed(`Deployment was canceled`);
      return false;
    }
    if (deployment.readyState === 'READY') {
      return true;
    }
  }
}

export function generateAliasPreviewUrl(urlTemplate: string) {
  const uuid = randomUUID();
  return urlTemplate.replace('{random}', uuid);
}

export async function aliasPreviewUrl(
  deploymentId: string,
  aliasTo: string,
  createOptions: {
    vercel_team_id: string;
    vercel_access_token: string;
  },
): Promise<string> {
  core.debug(`generate alias preview url: ${aliasTo}`);
  const aliasRes = await axios
    .post<AssignAlias>(
      `https://api.vercel.com/v2/deployments/${deploymentId}/aliases`,
      {
        alias: aliasTo,
      },
      {
        params: {
          teamId: createOptions.vercel_team_id,
        },
        headers: {
          Authorization: `Bearer ${createOptions.vercel_access_token}`,
        },
      },
    )
    .then(({ data }) => data);

  return aliasRes.alias;
}
