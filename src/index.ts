import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';

export const handler: APIGatewayProxyHandler = async (event, context) => {
  try {
    const apiRes = await axios.get<PackageVersion>(
      `https://api.verifynpm.com/v0/packages/${
        event.pathParameters['packageVersion']
      }`,
    );

    const { status } = apiRes.data;

    const color = mapStatusToColor(apiRes.data.status);

    const shieldRes = await axios.get<PackageVersion>(
      `https://img.shields.io/badge/tbv-${status}-${color}.svg`,
    );

    return {
      headers: { 'content-type': 'image/svg+xml' },
      statusCode: 200,
      body: JSON.stringify(shieldRes.data),
    };
  } catch {
    const shieldRes = await axios.get<PackageVersion>(
      `https://img.shields.io/badge/tbv-error-red.svg`,
    );

    return {
      headers: { 'content-type': 'image/svg+xml' },
      statusCode: 200,
      body: JSON.stringify(shieldRes.data),
    };
  }
};

function mapStatusToColor(status: PackageVersion['status']): Color {
  switch (status) {
    case 'error':
      return 'red';
    case 'pending':
      return 'blue';
    case 'timeout':
      return 'red';
    case 'unknown':
      return 'lightgray';
    case 'unverified':
      return 'yellow';
    case 'verified':
      return 'brightgreen';
  }
}

type Color =
  | 'brightgreen'
  | 'green'
  | 'yellowwgreen'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'lightgray'
  | 'blue';

type PackageVersion = {
  name: string;
  version: string;
  algo: string;
  status:
    | 'unknown'
    | 'pending'
    | 'verified'
    | 'unverified'
    | 'timeout'
    | 'error';
};
