// https://vercel.com/docs/rest-api#endpoints/deployments/list-deployments
export interface DeploymentV6 {
  uid: string;
  url: string;
  state?:
    | 'BUILDING'
    | 'ERROR'
    | 'INITIALIZING'
    | 'QUEUED'
    | 'READY'
    | 'CANCELED';
}

// https://vercel.com/docs/rest-api#endpoints/deployments/get-a-deployment-by-id-or-url
export interface DeploymentV13 {
  url: string;
  readyState:
    | 'QUEUED'
    | 'BUILDING'
    | 'ERROR'
    | 'INITIALIZING'
    | 'READY'
    | 'CANCELED';
}

// https://vercel.com/docs/rest-api#endpoints/aliases/assign-an-alias
export interface AssignAlias {
  uid: string;
  alias: string;
}
