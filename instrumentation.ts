import { type Instrumentation } from 'next';
import { posthog, readIdentity } from '@/lib/posthog/server';

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const { distinctId, properties } = readIdentity(request.headers.cookie);

  await posthog.captureExceptionImmediate(error, distinctId, {
    ...properties,
    path: request.path,
    method: request.method,
    route_path: context.routePath,
    route_type: context.routeType,
    router_kind: context.routerKind,
    render_source: context.renderSource,
  });
};
