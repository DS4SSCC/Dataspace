export const trailingSlash = 'ignore'

import {ServiceManager} from '@sourceregistry/svelte-service-manager';

const {endpoint, access} = ServiceManager.Base(
    ServiceManager.ServiceSelector.params('service_name')
);

export const {GET, PUT, POST, DELETE} = endpoint;

access('policy', 'dataset');
