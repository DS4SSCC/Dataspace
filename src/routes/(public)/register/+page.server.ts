import {Guard} from "$lib/server/helpers/guard.helper";
import {form} from "$lib/server/helpers/form.helper";
import {UserRepository} from "$lib/server/repositories/user.repository";
import {redirect} from "@sveltejs/kit";
import {hash} from "$lib/server/helpers/password.helper";

export const load = Guard.load(({locals}) => {
    if (locals.session) redirect(302, "/dashboard");
    return {};
})

export const actions = {
    register: Guard.action(async (event) => {
        const {guard: {form}} = event;
        await UserRepository.create({
            email: form.string$('user.email'),
            full_name: form.string$('user.full_name'),
            ...hash(form.string$('user.password')),
        })
        redirect(302, "/login");
    }, form.guard)
}
