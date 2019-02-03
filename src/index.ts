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

    const color = mapStatusToColor(status);
    const text = mapStatusToText(status);

    const shieldRes = await axios.get(
      `https://img.shields.io/badge/verification-${text}-${color}.svg`,
    );

    const headers = { 'content-type': 'image/svg+xml' };

    if (status === 'verified') {
      headers['Cache-Control'] = 'public, max-age=31536000';
    }

    return {
      headers,
      statusCode: 200,
      body: shieldRes.data,
    };
  } catch {
    const shieldRes = await axios.get<PackageVersion>(
      `https://img.shields.io/badge/tbv-error-red.svg`,
    );

    return {
      headers: { 'content-type': 'image/svg+xml' },
      statusCode: 200,
      body: shieldRes.data,
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

function mapStatusToText(status: PackageVersion['status']): string {
  switch (status) {
    case 'unverified':
      return 'failed';
    case 'verified':
      return 'passing';
    default:
      return status;
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
