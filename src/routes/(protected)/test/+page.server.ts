import {databaseTemp} from "$lib/assets/database.temp";
import {OpenDataSoftAdapter} from "$lib/server/adapters/opendatasoft";
import {CkanAdapter} from "$lib/server/adapters/ckan";

export const load = async () => {
    const eindhovenAdapter = new OpenDataSoftAdapter('https://data.eindhoven.nl');
    const overheidNlAdapter = new CkanAdapter('http://demo.ckan.org');

    return {
        eindhoven: eindhovenAdapter.convertToDcatAp(await eindhovenAdapter.getDatasets()),
        overheid: overheidNlAdapter.convertToDcatAp(await overheidNlAdapter.getDatasets())
    }
}
