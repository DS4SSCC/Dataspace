import {fail} from '@sveltejs/kit';
import type {GuardErrorHandler, GuardInput} from '$lib/server/helpers/guard.helper';
import {Decimal} from '@prisma/client/runtime/library';
import type {MaybePromise} from '$lib/server/types/MaybePromise';

const reviveMap = new Map<string | RegExp, (v: string) => any>([
    ['true', () => true],
    ['false', () => false],
    ['null', () => null],
    ['undefined', () => undefined],
    ['Infinity', () => Infinity],
    ['-Infinity', () => -Infinity],
    ['NaN', () => NaN],
    [/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/, (v) => Number(v)]
]);

const reviver = (key: string, value: any) => {
    if (typeof value !== 'string') return value;

    for (const [pattern, converter] of reviveMap) {
        if (
            (typeof pattern === 'string' && pattern === value) ||
            (pattern instanceof RegExp && pattern.test(value))
        ) {
            return converter(value);
        } else {
            try {
                return JSON.parse(value);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (ignored) {
                /* empty */
            }
        }
    }

    return value;
};

const createContext = (data: FormData) => {
    return {
        get data() {
            return data;
        },
        has: (name: string) => data.has(name),
        string: (name: string) => string(data, name) ?? undefined,
        _string: (name: string) => string(data, name),
        string$: (name: string) => string$(data, name),
        enum: <E extends Record<string, string | number | any>>(
            name: string,
            _enum: E,
        ): keyof E | undefined => Enum(data, name, _enum),
        enum$: <E extends Record<string, string | number | any>>(name: string, _enum: E, error: ((input: {
            data: FormData,
            name: string,
            _enum: E,
            value: string
        }) => string) = ({value}) => `${value} not part of enum`): keyof E =>
            Enum$(data, name, _enum, error),
        date: (
            name: string,
            parser: (formdata: FormData, name: string) => number | string | Date | undefined = (
                data,
                name
            ) => data.get(name) as string
        ) => date(data, name, parser),
        date$: (
            name: string,
            parser: (formdata: FormData, name: string) => number | string | Date = (data, name) =>
                data.get(name) as string
        ) => date$(data, name, parser),
        process: <T, R>(
            name: string,
            parser: ((formdata: FormData, name: string) => T) | ((name: string) => T),
            processor: (val: T) => R
        ) =>
            process<T, R>(
                data,
                name,
                (formdata, name) =>
                    parser.length === 2
                        ? (parser as (data: FormData, name: string) => T)(formdata, name)
                        : (parser as (name: string) => T)(name),
                processor
            ),
        number: (name: string) => number(data, name),
        number$: (name: string) => number$(data, name),
        decimal: (name: string) => decimal(data, name),
        decimal$: (name: string) => decimal$(data, name),
        boolean: (name: string) => boolean(data, name),
        boolean$: (name: string) => boolean$(data, name),
        json: <T = unknown, F = T>(
            name: string,
            transformer: (val: F) => T = (val) => <T>(<unknown>val)
        ) => json<T, F>(data, name, transformer),
        jsond: (
            options: {
                transform?: (value: FormDataEntryValue, key: string, data: FormData) => any;
                processor?: (input: any) => any;
            } & ({ prefix_name: string; unpack_prefixed?: true } | { prefix_name?: undefined })
        ) => jsond(data, options),
        json$: <T = unknown, F = T>(
            name: string,
            transformer: (val: F) => T = (val) => <T>(<unknown>val)
        ) => json$<T, F>(data, name, transformer),
        file: (name: string) => file(data, name),
        file$: (name: string) => file$(data, name),
        files: (name: string) => files(data, name),
        fileRecord: (prefix: string, removePrefix: boolean = false) =>
            fileRecord(data, prefix, removePrefix),
        array: <T>(
            name: string,
            mapper?: (item: FormDataEntryValue, index: number, array: FormDataEntryValue[]) => T
        ) => array<T>(data, name, mapper),
        array$: <T>(
            name: string,
            mapper?: (item: FormDataEntryValue, index: number, array: FormDataEntryValue[]) => T
        ) => array$<T>(data, name, mapper),
        onlyIf: <T = never>(condition: boolean, TRUE: T, FALSE = undefined) =>
            onlyIf<T>(condition, TRUE, FALSE),
        onlyIfPresent: <T = never>(
            key: string,
            TRUE: (entry: FormDataEntryValue) => T,
            FALSE = undefined
        ) => onlyIfPresent(data, key, TRUE, FALSE),
        onlyIfArrayPresent: <T, R>(key: string, TRUE: (entries: FormDataEntryValue[]) => T, FALSE: R) =>
            onlyIfArrayPresent<T, R>(data, key, TRUE, FALSE),
        selector: <
            C extends (A extends true
                ? { [K in string]: (entries: FormDataEntryValue[], key: K) => T }
                : { [K in string]: (entry: FormDataEntryValue, key: K) => T }) & {
                $error?: (error: unknown) => never;
                $default?: (data: FormData) => T;
            },
            A extends boolean = false,
            T = any
        >(
            cases: C,
            useArray: A = false as A
        ): ReturnType<C[keyof C]> | undefined => selector<C, A, T>(data, cases, useArray),
        selector$: <
            C extends (A extends true
                ? { [K in string]: (entries: FormDataEntryValue[], key: K) => T }
                : { [K in string]: (entry: FormDataEntryValue, key: K) => T }) & {
                $error?: (error: unknown) => never;
                $default?: (data: FormData) => T;
            },
            A extends boolean = false,
            T = any
        >(
            cases: C,
            useArray: A = false as A
        ): ReturnType<C[keyof C]> => selector$<C, A, T>(data, cases, useArray),
        basedOn: <T = unknown, R = unknown>(
            val: T,
            processor: (val: T) => R = (val) => <R>(<unknown>val)
        ) => basedOn<T, R>(val, processor),
        record: <T = any>(
            options: Partial<{
                transformer: (
                    value: [string, FormDataEntryValue | FormDataEntryValue[]]
                ) => [string, any | any[]];
                filter: (value: [string, FormDataEntryValue | FormDataEntryValue[]]) => boolean;
            }>
        ) => record(data, options) as T
    };
};

export function string(formdata: FormData, name: string) {
    if (!formdata.has(name)) {
        return undefined;
    }
    const data = formdata.get(name);
    if (data === 'null' || data === null) return null;
    if (typeof data != 'string') {
        throw () => fail(400, {targets: [name], message: `${name} isn't of type string`});
    }
    return data as string;
}

export function string$(formdata: FormData, name: string) {
    if (!formdata.has(name)) {
        throw () => fail(400, {targets: [name], message: `${name} is required`});
    }
    const data = formdata.get(name);
    if (typeof data != 'string') {
        throw () => fail(400, {targets: [name], message: `${name} is not correct data type`});
    }
    return data as string;
}

export function number(formdata: FormData, name: string) {
    if (!formdata.has(name)) {
        return undefined;
    }
    const num = Number(formdata.get(name));
    if (isNaN(num)) {
        throw () => fail(400, {targets: [name], message: `${name} isn't of type number`});
    }
    return num;
}

export function number$(formdata: FormData, name: string) {
    const _number = number(formdata, name);
    if (_number === undefined) {
        throw () => fail(400, {targets: [name], message: `${name} is required`});
    }
    return _number;
}

export function decimal(formdata: FormData, name: string) {
    try {
        if (!formdata.has(name)) return undefined;
        return new Decimal(formdata.get(name) as string);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        throw () => fail(400, {targets: [name], message: `${name} isn't of type decimal`});
    }
}

export function decimal$(formdata: FormData, name: string) {
    const _decimal = decimal(formdata, name);
    if (!_decimal) {
        throw () => fail(400, {targets: [name], message: `${name} is required`});
    }
    return _decimal;
}

export function boolean(formdata: FormData, name: string) {
    if (!formdata.has(name)) {
        return undefined;
    }
    const data = formdata.get(name) as string;
    const num = Number(data);
    if (!isNaN(num)) {
        return num > 0;
    } else {
        return data.trim().toLowerCase().startsWith('t') || data.trim().toLowerCase() === 'on';
    }
}

export function boolean$(formdata: FormData, name: string) {
    if (!formdata.has(name)) {
        throw () => fail(400, {targets: [name], message: `${name} is required`});
    }
    const data = formdata.get(name) as string;
    const num = Number(data);
    if (!isNaN(num)) {
        return num > 0;
    } else {
        return data.trim().toLowerCase().startsWith('t') || data.trim().toLowerCase() === 'on';
    }
}

export function date(
    formdata: FormData,
    name: string,
    parser: (formdata: FormData, name: string) => number | string | Date | undefined = (data, name) =>
        data.get(name) as string
) {
    if (!formdata.has(name)) {
        return undefined;
    }
    const val = parser(formdata, name);
    if (!val) {
        return undefined;
    }
    return new Date(val);
}

export function date$(
    formdata: FormData,
    name: string,
    parser: (formdata: FormData, name: string) => number | string | Date
) {
    return new Date(parser(formdata, name));
}

export function json<T = unknown, F = T>(
    formdata: FormData,
    name: string,
    transformer: (val: F) => T = (val) => <T>(<unknown>val)
) {
    if (!formdata.has(name)) {
        return undefined;
    }
    try {
        return transformer(JSON.parse(formdata.get(name) as string, reviver));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        throw () => fail(400, {targets: [name], message: `${name} isn't of json`});
    }
}

export function record(
    formdata: FormData,
    options: Partial<{
        transformer: (
            value: [string, FormDataEntryValue | FormDataEntryValue[]]
        ) => [string, any | any[]];
        filter: (value: [string, FormDataEntryValue | FormDataEntryValue[]]) => boolean;
    }>
) {
    return Object.fromEntries(
        formdata
            .keys()
            .map((key) => {
                let entry: [string, any | any[]] = [key, formdata.getAll(key)];
                if (options.filter && !options.filter(entry)) return;
                if (options.transformer) entry = options.transformer(entry);
                return entry;
            })
            .filter((v) => v !== undefined)
            .map(([key, value]) => [key, Array.isArray(value) && value.length === 1 ? value[0] : value])
    );
}

export function json$<T = unknown, F = T>(
    formdata: FormData,
    name: string,
    transformer: (val: F) => T = (val) => <T>(<unknown>val)
) {
    if (!formdata.has(name)) {
        throw () => fail(400, {targets: [name], message: `${name} doesn't exist`});
    }
    try {
        return transformer(JSON.parse(formdata.get(name) as string, reviver));
    } catch (e) {
        throw () =>
            fail(400, {
                targets: [name],
                message: `${name} isn't of type json`,
                error: e instanceof Error ? e?.message : e?.toString()
            });
    }
}

export function jsond(
    formdata: FormData,
    options: {
        prefix_name?: string;
        unpack_prefixed?: boolean;
        transform?: (value: FormDataEntryValue, key: string, data: FormData) => any;
        processor?: (input: any) => any;
    } = {
        unpack_prefixed: true,
        transform: (value) => value
    }
) {
    let result: any = {};
    formdata
        .entries()
        .filter(([key]) => (options.prefix_name ? key.startsWith(options.prefix_name) : key))
        .map(
            ([key, value]) =>
                [key, (options.transform ?? ((value) => value))(value, key, formdata)] as [string, any]
        )
        .map(
            ([key, value]) =>
                (options.unpack_prefixed && options.prefix_name
                    ? [key.replace(options.prefix_name, ''), value]
                    : [key, value]) as [string, any]
        )
        .forEach(([key, value]) => {
            const splits = key.split('.');
            let context = result;
            splits.forEach((part, index) => {
                if (index === splits.length - 1) {
                    // If it's the last part, check if the key already exists
                    if (context[part] === undefined) {
                        context[part] = value;
                    } else if (Array.isArray(context[part])) {
                        context[part].push(value);
                    } else {
                        context[part] = [context[part], value];
                    }
                } else {
                    // If the key doesn't exist, initialize it as an object
                    if (!context[part]) context[part] = {};
                    // Move deeper into the object
                    context = context[part];
                }
            });
        });
    if (options.processor) {
        result = options.processor(result);
    }
    return result;
}

export function file(formdata: FormData, name: string) {
    if (!formdata.has(name)) {
        return undefined;
    }
    const data = formdata.get(name);
    if (data instanceof File) {
        return formdata.get(name) as File;
    } else if (data === null || data === 'null') {
        return null;
    }
    throw () => fail(400, {targets: [name], message: `${name} isn't of type File`});
}

export function fileRecord(formdata: FormData, prefix: string, removePrefix: boolean = false) {
    const record: Record<string, File[]> = {};
    formdata
        .entries()
        .filter(
            ([key, value]) =>
                key.startsWith(prefix) && value instanceof File && value.size > 0 && value.name.length > 0
        )
        .map(
            ([key, value]) =>
                [removePrefix ? key.replace(prefix, '') : key, value as File] as [string, File]
        )
        .forEach(([key, value]) => {
            if (!(key in record) || !record[key]) return (record[key] = [value]);
            else record[key].push(value);
        });
    return record;
}

export function file$(formdata: FormData, name: string) {
    if (!formdata.has(name)) {
        throw () => fail(400, {targets: [name], message: `${name} doesn't exist`});
    }
    const data = formdata.get(name);
    if (data instanceof File) {
        return formdata.get(name) as File;
    }
    throw () => fail(400, {targets: [name], message: `${name} isn't of type File`});
}

export function files(formdata: FormData, name: string) {
    if (!formdata.has(name)) {
        return <File[]>[];
    }
    return <File[]>(
        formdata.getAll(name).filter((e) => e instanceof File && e.size > 0 && e.name.length > 0)
    );
}

export function array<T>(
    formdata: FormData,
    name: string,
    mapper?: (item: FormDataEntryValue, index: number, array: FormDataEntryValue[]) => T
) {
    if (!formdata.has(name)) {
        return undefined;
    }
    const array = formdata.getAll(name);
    if (array.length === 1 && array[0] === '[]') {
        return <T[]>[];
    }
    if (!mapper) {
        return <T[]>array;
    }
    return <T[]>array.map(mapper);
}

export function array$<T>(
    formdata: FormData,
    name: string,
    mapper?: (item: FormDataEntryValue, index: number, array: FormDataEntryValue[]) => T
) {
    if (!formdata.has(name)) {
        throw () => fail(400, {targets: [name], message: `${name} doesn't exist`});
    }
    const array = formdata.getAll(name);
    if (!mapper) {
        return <T[]>array;
    }
    const res = <T[]>array.map(mapper);
    if (res.length === 0) {
        throw () => fail(400, {targets: [name], message: `${name} length of array === 0`});
    }
    return res;
}

/**
 * TODO not compliant with enum standard but works for now
 * @param formdata
 * @param name
 * @param _enum
 */
export function Enum<E extends Record<string, string | number | any>>(
    formdata: FormData,
    name: string,
    _enum: E,
): keyof E | undefined {
    if (!formdata.has(name)) return undefined;
    const data = formdata.get(name);
    if (typeof data != 'string') throw () => fail(400, {targets: [name], message: `${name} isn't of type in enum`});
    if (!(data in _enum)) return undefined
    return data as keyof E;
}

/**
 * TODO not compliant with enum standard but works for now
 * @param formdata
 * @param name
 * @param _enum
 * @param error
 */
export function Enum$<E extends Record<string, string | number | any>>(
    formdata: FormData,
    name: string,
    _enum: E,
    error: ((input: {
        data: FormData,
        name: string,
        _enum: E,
        value: string
    }) => string) = ({value}) => `${value} not part of enum`
): keyof E {
    const data = Enum(formdata, name, _enum);
    if (!data) {
        throw () => fail(400, {
            targets: [name],
            message: error({data: formdata, name, _enum, value: formdata.get(name) as string})
        });
    }
    return data;
}

export function OldArray<T = string>(
    formdata: FormData,
    name: string,
    parser: (input: { data: string }) => T[]
) {
    const data = string(formdata, name);
    if (!data) {
        return [];
    }
    return parser({data});
}

export function arrayString<T = string>(
    formdata: FormData,
    name: string,
    delimiter: string,
    mapper?: (item: string) => T
) {
    return OldArray(formdata, name, ({data}) => data.split(delimiter).map(mapper ?? ((i) => <T>i)));
}

export function onlyIf<T = never>(condition: boolean, TRUE: T, FALSE = undefined) {
    return condition ? TRUE : FALSE;
}

export function onlyIfPresent<T = never>(
    formdata: FormData,
    key: string,
    TRUE: (entry: FormDataEntryValue) => T,
    FALSE = undefined
) {
    return formdata.has(key) ? TRUE(<FormDataEntryValue>formdata.get(key)) : FALSE;
}

export function onlyIfArrayPresent<T, R>(
    formdata: FormData,
    key: string,
    TRUE: (entries: FormDataEntryValue[]) => T,
    FALSE: R
): T | R {
    return formdata.has(key) && Array.isArray(formdata.getAll(key))
        ? TRUE(formdata.getAll(key))
        : FALSE;
}

export function basedOn<T = unknown, R = unknown>(
    val: T,
    processor: (val: T) => R = (val) => <R>(<unknown>val)
) {
    return processor(val);
}

export function selector<
    C extends (A extends true
        ? { [K in string]: (entries: FormDataEntryValue[], key: K) => T }
        : { [K in string]: (entry: FormDataEntryValue, key: K) => T }) & {
        $error?: (error: unknown) => never;
        $default?: (data: FormData) => T;
    },
    A extends boolean = false,
    T = any
>(formData: FormData, cases: C, useArray: A = false as A): ReturnType<C[keyof C]> | undefined {
    try {
        for (const key of formData.keys()) {
            if (key in cases) {
                const processor = cases[key as keyof typeof cases];
                if (formData.has(key)) {
                    if (useArray) {
                        const data = formData.getAll(key);
                        if (data.length > 0) {
                            return (
                                processor as (
                                    entries: FormDataEntryValue[],
                                    key: string
                                ) => ReturnType<C[keyof C]> | undefined
                            )(data, key);
                        }
                    } else {
                        const data = formData.get(key);
                        if (data !== null) {
                            return (
                                processor as (
                                    entry: FormDataEntryValue,
                                    key: string
                                ) => ReturnType<C[keyof C]> | undefined
                            )(data, key);
                        }
                    }
                }
            }
        }
        if ('$default' in cases) {
            return (cases.$default as any)(formData);
        }
    } catch (error) {
        // Call $error in case of any error
        if ('$error' in cases) {
            return cases.$error?.(error);
        }
    }
    return undefined;
}

export function selector$<
    C extends (A extends true
        ? { [K in string]: (entries: FormDataEntryValue[], key: K) => T }
        : { [K in string]: (entry: FormDataEntryValue, key: K) => T }) & {
        $error?: (error: unknown) => never;
        $default?: (data: FormData) => T;
    },
    A extends boolean = false,
    T = any
>(formData: FormData, cases: C, useArray: A = false as A): NonNullable<ReturnType<C[keyof C]>> {
    const result = selector(formData, cases, useArray);
    if (!result) {
        if ('$error' in cases) {
            cases?.['$error']?.('Unable to find value');
        }
        throw () => fail(400, {targets: Object.keys(cases), message: `Unable to find value`});
    }
    return result as NonNullable<ReturnType<C[keyof C]>>;
}

export async function handle<T>(
    data: MaybePromise<FormData> | Request,
    fn: (input: { data: FormData; form: ReturnType<typeof createContext> }) => MaybePromise<T>,
    ...errorHandlers: GuardErrorHandler[]
): Promise<T> {
    try {
        if (
            data instanceof Request &&
            data.headers.has('Content-Type') &&
            data.headers.get('Content-Type')?.includes('form')
        ) {
            data = await data.formData();
        } else {
            throw () => fail(400, {message: "Request doesn't contain form data"});
        }
        return await fn({data: data as FormData, form: createContext(data)});
    } catch (e) {
        if (typeof e === 'function') {
            return e();
        }
        for (const errorHandler of errorHandlers) {
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
    }
}

export async function guard(input: GuardInput) {
    return {
        form: createContext(
            input.request.headers.has('Content-Type') &&
            input.request.headers.get('Content-Type')?.includes('form')
                ? await input.request.formData()
                : new FormData()
        )
    };
}

export function process<T, R>(
    formdata: FormData,
    name: string,
    parser: (formdata: FormData, name: string) => T,
    processor: (val: T) => R
) {
    return processor(parser(formdata, name));
}

export const form = {
    string,
    string$,
    number,
    number$,
    decimal,
    decimal$,
    boolean,
    boolean$,
    date,
    date$,
    file,
    file$,
    files,
    array,
    array$,
    json,
    json$,
    jsond,
    process,
    onlyIf,
    onlyIfPresent,
    onlyIfArrayPresent,
    selector,
    selector$,
    guard,
    handle
};
