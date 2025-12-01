import {Guard} from "$lib/server/helpers/guard.helper";
import {form} from "$lib/server/helpers/form.helper";
import {Service} from "@sourceregistry/svelte-service-manager";

export const actions = {
    test: Guard.action(async ({params: {policy_id}, guard: {form}}) => {
        const input = form.json$<any>('policy.input')
        const result = await Service('policy').execute(input, {id: policy_id})
        console.log("Test result", result);
        return result;
    }, form.guard)
}
