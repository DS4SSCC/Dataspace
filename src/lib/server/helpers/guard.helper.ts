import {
	type Action,
	type ActionResult,
	type Cookies,
	error as SError,
	fail as SFail,
	type Handle,
	isHttpError,
	isRedirect,
	type RequestEvent,
	type ResolveOptions,
	type ServerLoadEvent
} from '@sveltejs/kit';

import type {RouteId as _AppRouteId} from '$app/types'

import type { MaybePromise } from '$lib/server/types/MaybePromise';

export type GuardErrorHandler = <T>(err: unknown) => MaybePromise<T> | undefined | never | void;
export type GuardResponseHandler = (input: {
	event: RequestEvent;
	response: Response;
}) => MaybePromise<unknown>;

export type GuardCallType = 'handle' | 'load' | 'method' | 'action';

type AppRouteId = _AppRouteId | string | null

export type GuardInput<
	CallType extends GuardCallType = GuardCallType,
	Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
	RouteId extends AppRouteId | null = AppRouteId | null,
	ParentData extends Record<string, any> = Record<string, any>
> = {
	cookies: Cookies;
	params: Params;
	route: { id: RouteId };
	url: URL;
	locals: App.Locals;
	request: Request;
	callType: CallType;
	get errorHandlers(): GuardErrorHandler[];
} & (CallType extends 'handle'
	? {
		get responseHandlers(): GuardResponseHandler[];
		resolve: (event?: RequestEvent) => never;
		readonly event: RequestEvent;
	}
	: CallType extends 'load'
		? {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			parent: ServerLoadEvent<Params, ParentData, RouteId>['parent'];
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			depends: ServerLoadEvent<Params, ParentData, RouteId>['depends'];
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			untrack: ServerLoadEvent<Params, ParentData, RouteId>['untrack'];
		}
		: object);

export type GuardFunction<
	CallType extends GuardCallType = GuardCallType,
	Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
	RouteId extends AppRouteId | null = AppRouteId | null,
	GuardReturn = any
> = (event: GuardInput<CallType, Params, RouteId>) => MaybePromise<GuardReturn>;

export type GuardedAction<
	Params extends Partial<Record<string, string>>,
	OutputData extends Record<string, any> | void,
	RouteId extends AppRouteId | null,
	GuardReturn extends ActionResult | never | any = ActionResult
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
> = (event: RequestEvent<Params, RouteId> & { guard: GuardReturn }) => MaybePromise<OutputData>;

export type GuardedLoad<
	Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
	ParentData extends Record<string, any> = Record<string, any>,
	OutputData extends Record<string, any> | void = Record<string, any> | void,
	RouteId extends AppRouteId | null = AppRouteId | null,
	GuardReturn extends never | any = any
> = (
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	event: ServerLoadEvent<Params, ParentData, RouteId> & { guard: GuardReturn }
) => MaybePromise<OutputData>;

export type GuardedHandle<GuardReturn extends never | any = any> = (
	input: {
		event: RequestEvent;
		resolve(event: RequestEvent, opts?: ResolveOptions): MaybePromise<Response>;
	} & { guard: GuardReturn }
) => MaybePromise<Response>;

const GuardErrorHandle = async (e: unknown, guardInput: GuardInput) => {
	if (isRedirect(e) || isHttpError(e)) {
		throw e;
	} else if (typeof e === 'function') {
		return e();
	} else if (e instanceof Response) {
		return e;
	} else if (e instanceof Promise) {
		return e;
	}
	for (const errorHandler of guardInput.errorHandlers) {
		try {
			await errorHandler(e);
		} catch (e) {
			if (typeof e === 'function') {
				return e();
			}
			throw e;
		}
	}
	throw e;
};

export type GuardedMethod<
	Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
	RouteId extends AppRouteId | null = AppRouteId | null,
	GuardReturn extends never | any = any
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
> = (event: RequestEvent<Params, RouteId> & { guard: GuardReturn }) => MaybePromise<Response>;

export const action =
	<
		Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
		OutputData extends Record<string, any> | void = Record<string, any> | void,
		RouteId extends AppRouteId | null = AppRouteId | null,
		Guards extends GuardFunction<'action', Params, RouteId, object>[] = GuardFunction<
			'action',
			Params,
			RouteId,
			object
		>[],
		GuardReturn extends ConcatReturnTypes<Guards> = ConcatReturnTypes<Guards>
	>(
		action: GuardedAction<Params, OutputData, RouteId, GuardReturn>,
		...guards: Guards
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
	): Action<Params, OutputData, RouteId> =>
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		async (event: RequestEvent<Params, RouteId>): Promise<OutputData> => {
			let combined: GuardReturn = {} as GuardReturn;
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			const guardInput: GuardInput<'action', Params, RouteId> & RequestEvent<Params, RouteId> =
				Object.assign(event, {
					__errorHandlers__: [] as GuardErrorHandler[],
					isAction: false,
					callType: 'action',
					get errorHandlers() {
						return this.__errorHandlers__;
					}
				} as any);
			for (const guard of guards) {
				try {
					const result = await guard(guardInput);
					combined = Object.assign(combined, result);
				} catch (e) {
					return GuardErrorHandle(e, guardInput);
				}
			}
			try {
				return await action(Object.assign(guardInput, { guard: combined }));
			} catch (e) {
				return GuardErrorHandle(e, guardInput);
			}
		};
export const load = <
	Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
	ParentData extends Record<string, any> = Record<string, any>,
	OutputData extends Record<string, any> | void = Record<string, any> | void,
	RouteId extends AppRouteId | null = AppRouteId | null,
	Guards extends GuardFunction<'load', Params, RouteId, object>[] = GuardFunction<
		'load',
		Params,
		RouteId,
		object
	>[],
	GuardReturn extends ConcatReturnTypes<Guards> = ConcatReturnTypes<Guards>
>(
	load: GuardedLoad<Params, ParentData, OutputData, RouteId, GuardReturn>,
	...guards: Guards
) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	return async (event: ServerLoadEvent<Params, ParentData, RouteId>): Promise<OutputData> => {
		let combined: GuardReturn = {} as GuardReturn;
		const guardInput: GuardInput<'load', Params, RouteId> &
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			ServerLoadEvent<Params, ParentData, RouteId> = Object.assign(event, {
			__errorHandlers__: [] as GuardErrorHandler[],
			isAction: false,
			callType: 'load',
			get errorHandlers() {
				return this.__errorHandlers__;
			}
		} as any);
		for (const guard of guards) {
			try {
				const result = await guard(guardInput);
				combined = Object.assign(combined, result);
			} catch (e) {
				return GuardErrorHandle(e, guardInput);
			}
		}
		try {
			return load(Object.assign(guardInput, { guard: combined }));
		} catch (e) {
			return GuardErrorHandle(e, guardInput);
		}
	};
};

export const method = <
	Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
	RouteId extends AppRouteId | string = AppRouteId | string,
	Guards extends GuardFunction<'method', Params, RouteId, object>[] = GuardFunction<
		'method',
		Params,
		RouteId,
		object
	>[],
	GuardReturn extends Awaited<ConcatReturnTypes<Guards>> = Awaited<ConcatReturnTypes<Guards>>
>(
	handle: GuardedMethod<Params, RouteId, GuardReturn>,
	...guards: Guards
) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	return async (event: RequestEvent<Params, RouteId>): Promise<Response> => {
		let combined: GuardReturn = {} as GuardReturn;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		const guardInput: GuardInput<'method', Params, RouteId> & RequestEvent<Params, RouteId> =
			Object.assign(event, {
				__errorHandlers__: [] as GuardErrorHandler[],
				isAction: false,
				callType: 'method',
				get errorHandlers() {
					return this.__errorHandlers__;
				}
			} as any);
		for (const guard of guards) {
			try {
				const result = await guard(guardInput);
				combined = Object.assign(combined, result);
			} catch (e) {
				return GuardErrorHandle(e, guardInput);
			}
		}
		try {
			return await handle(Object.assign(guardInput, { guard: combined }));
		} catch (e) {
			return GuardErrorHandle(e, guardInput);
		}
	};
};

export const handle = <
	Guards extends GuardFunction<'handle'>[] = GuardFunction<'handle'>[],
	GuardReturn extends Awaited<ConcatReturnTypes<Guards>> = Awaited<ConcatReturnTypes<Guards>>
>(
	handle: GuardedHandle<GuardReturn>,
	...guards: Guards
) => {
	return (async (input): Promise<Response> => {
		let combined: GuardReturn = {} as GuardReturn;
		const guardInput: GuardInput<'handle'> & RequestEvent & {
			get responseHandlers(): GuardResponseHandler[];
		} =
			Object.assign(input.event, {
				__errorHandlers__: [] as GuardErrorHandler[],
				__responseHandler__: [] as GuardResponseHandler[],
				isAction: false,
				callType: 'handle',
				get errorHandlers() {
					return this.__errorHandlers__;
				},
				get responseHandlers() {
					return this.__responseHandler__;
				},
				resolve: (event: RequestEvent = input.event) => {
					throw input.resolve(event);
				},
				get event() {
					return input.event;
				}
			} as any);
		for (const guard of guards) {
			try {
				const result = await guard(guardInput);
				combined = Object.assign(combined, result);
			} catch (e) {
				return GuardErrorHandle(e, guardInput);
			}
		}
		try {
			const response = await handle(Object.assign(input, { guard: combined }));
			if (guardInput.responseHandlers.length > 0) {
				for (const responseHandler of guardInput.responseHandlers) {
					await responseHandler({ event: guardInput, response });
				}
			}
			return response;
		} catch (e) {
			return GuardErrorHandle(e, guardInput);
		}
	}) as Handle;
};

export const Guard = {
	action,
	load,
	method,
	handle
};

export type Guards<
	Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
	RouteId extends AppRouteId | null = AppRouteId | null,
	GuardReturn extends never | any = any
> = Record<string, GuardFunction<GuardCallType, Params, RouteId, GuardReturn>>;

export type Func = (...args: any[]) => any;

export type ConcatReturnTypes<T extends Func[]> = T extends []
	? NonNullable<unknown>
	: T extends [infer First, ...infer Rest]
		? First extends Func
			? (ReturnType<First> extends Promise<infer P> ? P : ReturnType<First>) &
			ConcatReturnTypes<Rest extends Func[] ? Rest : []>
			: NonNullable<unknown>
		: NonNullable<unknown>;

export const fail = <T extends Record<string, unknown> | undefined = undefined>(
	status: number,
	data: T
): never => {
	throw () => SFail(status, data);
};
export const error = (
	status: number,
	body?: {
		message: string;
	} extends App.Error
		? App.Error | string | undefined
		: never
) => SError(status, body);
export const success = <T extends Record<string, unknown> | undefined = undefined>(data: T) => data;

export function not_good(
	input: { callType: GuardInput['callType'] },
	status: number,
	arg?: App.Error | string | Record<string, unknown> | undefined
) {
	// Based on callType, call the appropriate function.
	return (input.callType === 'action' ? fail : error)(status, arg as any);
}
