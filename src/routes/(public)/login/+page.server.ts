import {Guard} from "$lib/server/helpers/guard.helper";
import {form} from "$lib/server/helpers/form.helper";
import {SessionContext} from "$lib/server/configurations/session_context.config";
import {UserRepository} from "$lib/server/repositories/user.repository";
import {fail, redirect} from "@sveltejs/kit";
import {validate} from "$lib/server/helpers/password.helper";

export const load = Guard.load(({locals}) => {
    if (locals.session) redirect(302, "/dashboard");
    return {};
})

export const actions = {
    login: Guard.action(async (event) => {
        const {guard: {form}} = event;
        const user = await UserRepository.getByEmail(form.string$('user.email'))
        if (!user) return fail(401, {message: "Invalid username or password."});
        if (!validate(form.string$('user.password'), user.password_hash, user.password_salt, user.password_digest))
            return fail(401, {message: "Invalid username or password."});
        await SessionContext.createContext({user}, event);
        redirect(302, "/dashboard");
    }, form.guard)
}
