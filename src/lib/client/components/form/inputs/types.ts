// Base input types
import type { MaybePromise } from '$lib/server-lib/types/MaybePromise';

export type GenericInput = {
	id?: string;
	type: string;
	label: string;
	name: string;
	description?: string;
	required?: boolean;
	data?: Record<string, any>;
};

export type GenericTypDependantInput<T> = {
	placeholder?: string;
	default?: T;
	value?: T;
} & Omit<GenericInput, 'type'>;

export type StringInput = {
	type: 'string' | 'text' | 'textarea';
	pattern?: string,
	rows?: number;
} & GenericTypDependantInput<string>;
export type TagInput = {
	type: 'tags';
} & GenericTypDependantInput<string[]>;

export type PasswordInput = {
	type: 'password';
} & GenericTypDependantInput<string>;

export type HiddenInput = {
	type: 'hidden';
	value: { toString(): string } | string | number | boolean;
	label?: string;
} & Omit<GenericInput, 'label'>;

export type NumberInput = {
	type: 'number';
	step?: number;
	min?: number;
	max?: number;
} & GenericTypDependantInput<number>;

export type URLInput = {
	type: 'url';
} & GenericTypDependantInput<string>;

export type EmailInput = {
	type: 'email';
} & GenericTypDependantInput<string>;

export type TelephoneInput = {
	type: 'tel';
} & GenericTypDependantInput<string>;

export type FileInput = {
	type: 'file';
	accepts?: string[];
} & GenericTypDependantInput<File>;

export type BooleanInput = {
	type: 'bool' | 'boolean' | 'checkbox' | 'radio';
} & GenericTypDependantInput<boolean>;

export type SelectInput = {
	type: 'select' | 'options';
	multiple?: boolean;
	options: { label?: string; value: string }[];
} & GenericTypDependantInput<string>;

type DateInput = {
	type: 'date';
	min?: Date | number;
	max?: Date | number;
	step?: number;
} & GenericTypDependantInput<Date>;

type TimeInput = {
	type: 'time';
	min?: string;
	max?: string;
	step?: number;
} & GenericTypDependantInput<string>;

type DateTimeInput = {
	type: 'datetime-local' | 'datetime';
	min?: Date;
	max?: Date;
	step?: number;
} & GenericTypDependantInput<Date>;

export type CustomInput<T = any, C extends string = string> = {
	type: `custom` | string;
	custom_type?: C;
} & GenericTypDependantInput<T>;

export type InputType =
	| StringInput
	| URLInput
	| EmailInput
	| TelephoneInput
	| FileInput
	| NumberInput
	| BooleanInput
	| SelectInput
	| HiddenInput
	| PasswordInput
	| DateInput
	| DateTimeInput
	| TimeInput
	| TagInput
	| CustomInput;

// Helper to extract the value type based on input type
type InputToValueType<T extends InputType> = T extends
	| StringInput
	| URLInput
	| EmailInput
	| TelephoneInput
	| PasswordInput
	? string
	: T extends TagInput
		? string[]
		: T extends NumberInput
			? number
			: T extends BooleanInput
				? boolean
				: T extends FileInput
					? File
					: T extends SelectInput
						? string
						: T extends HiddenInput
							? string | number | boolean
							: T extends DateInput | DateTimeInput
								? Date
								: T extends TimeInput
									? string
									: T extends CustomInput<infer U>
										? U
										: unknown;

// Main mapped type to build the record
export type InputRecord<T extends readonly InputType[]> = {
	[K in T[number] as K['name']]: K['required'] extends true
		? InputToValueType<K>
		: InputToValueType<K> | undefined;
};

export const TemplateInputTypes = [
	{
		type: 'text',
		label: 'Text',
		icon: '📝',
		properties: [
			{ type: 'checkbox', label: 'Required Field', name: 'required' },
			{
				type: 'text',
				label: 'Placeholder',
				name: 'placeholder',
				placeholder: 'Enter placeholder text'
			},
			{ type: 'text', label: 'Default Value', name: 'default', placeholder: 'Enter default value' },
			{
				type: 'number',
				label: 'Minimum Length',
				name: 'minLength',
				placeholder: 'Enter minimum length'
			},
			{
				type: 'number',
				label: 'Maximum Length',
				name: 'maxLength',
				placeholder: 'Enter maximum length'
			},
			{
				type: 'text',
				label: 'Pattern (Regex)',
				name: 'pattern',
				placeholder: 'Enter regex pattern'
			}
		]
	},
	{
		type: 'textarea',
		label: 'Textarea',
		icon: '📄',
		properties: [
			{ type: 'checkbox', label: 'Required Field', name: 'required' },
			{
				type: 'text',
				label: 'Placeholder',
				name: 'placeholder',
				placeholder: 'Enter placeholder text'
			},
			{
				type: 'textarea',
				label: 'Default Value',
				name: 'default',
				placeholder: 'Enter default value'
			},
			{
				type: 'number',
				label: 'Minimum Length',
				name: 'minLength',
				placeholder: 'Enter minimum length'
			},
			{
				type: 'text',
				label: 'Pattern (Regex)',
				name: 'pattern',
				placeholder: 'Enter regex pattern'
			}
		]
	},
	{
		type: 'email',
		label: 'Email',
		icon: '✉️',
		properties: [
			{ type: 'checkbox', label: 'Required Field', name: 'required' },
			{
				type: 'text',
				label: 'Placeholder',
				name: 'placeholder',
				placeholder: 'Enter placeholder text'
			},
			{ type: 'email', label: 'Default Value', name: 'default', placeholder: 'Enter default email' }
		]
	},
	{
		type: 'tel',
		label: 'Telephone',
		icon: '☎️',
		properties: [
			{ type: 'checkbox', label: 'Required Field', name: 'required' },
			{
				type: 'tel',
				label: 'Placeholder',
				name: 'placeholder',
				placeholder: 'Enter placeholder text'
			}
		]
	},
	{
		type: 'url',
		label: 'URL',
		icon: '🔗',
		properties: [
			{ type: 'checkbox', label: 'Required Field', name: 'required' },
			{
				type: 'text',
				label: 'Placeholder',
				name: 'placeholder',
				placeholder: 'Enter placeholder text'
			},
			{ type: 'url', label: 'Default Value', name: 'default', placeholder: 'Enter default url' }
		]
	},
	{
		type: 'password',
		label: 'Password',
		icon: '🔒',
		properties: [
			{ type: 'checkbox', label: 'Required Field', name: 'required' },
			{
				type: 'text',
				label: 'Placeholder',
				name: 'placeholder',
				placeholder: 'Enter placeholder text'
			},
			{
				type: 'number',
				label: 'Minimum Length',
				name: 'minLength',
				placeholder: 'Enter minimum length'
			},
			{
				type: 'number',
				label: 'Maximum Length',
				name: 'maxLength',
				placeholder: 'Enter maximum length'
			}
		]
	},
	{
		type: 'number',
		label: 'Number',
		icon: '🔢',
		properties: [
			{ type: 'checkbox', label: 'Required Field', name: 'required' },
			{
				type: 'text',
				label: 'Placeholder',
				name: 'placeholder',
				placeholder: 'Enter placeholder text'
			},
			{
				type: 'number',
				label: 'Default Number',
				name: 'default',
				placeholder: 'Enter default number'
			},
			{ type: 'number', label: 'Minimum Value', name: 'min', placeholder: 'Enter minimum value' },
			{ type: 'number', label: 'Maximum Value', name: 'max', placeholder: 'Enter maximum value' },
			{
				type: 'number',
				label: 'Step Size',
				name: 'step',
				placeholder: 'Enter step size',
				default: 1
			}
		]
	},
	{
		type: 'boolean',
		label: 'Checkbox',
		icon: '☑️',
		properties: [
			{ type: 'checkbox', label: 'Required Field', name: 'required' },
			{ type: 'checkbox', label: 'Default Value', name: 'default', default: false },
			{ type: 'text', label: 'Checkbox Label', name: 'label', placeholder: 'Enter checkbox label' }
		]
	},
	{
		type: 'date',
		label: 'Date',
		icon: '📅',
		properties: [
			{ type: 'checkbox', label: 'Required Field', name: 'required' },
			{ type: 'date', label: 'Default Value', name: 'default' },
			{ type: 'date', label: 'Minimum Date', name: 'min' },
			{ type: 'date', label: 'Maximum Date', name: 'max' }
		]
	},
	{
		type: 'datetime-local',
		label: 'Date & Time',
		icon: '📅',
		properties: [
			{ type: 'checkbox', label: 'Required Field', name: 'required' },
			{ type: 'datetime-local', label: 'Default Value', name: 'default' },
			{ type: 'datetime-local', label: 'Minimum Date/Time', name: 'min' },
			{ type: 'datetime-local', label: 'Maximum Date/Time', name: 'max' }
		]
	},
	{
		type: 'time',
		label: 'Time',
		icon: '🕐',
		properties: [
			{ type: 'checkbox', label: 'Required Field', name: 'required' },
			{ type: 'time', label: 'Default Value', name: 'default' },
			{ type: 'time', label: 'Minimum Time', name: 'min' },
			{ type: 'time', label: 'Maximum Time', name: 'max' }
		]
	},
	{
		type: 'select',
		label: 'Select',
		icon: '📋',
		properties: [
			{ type: 'checkbox', label: 'Required Field', name: 'required' },
			// { type: 'select', label: 'Default Value', name: 'default' },
			{
				type: 'tags',
				label: 'Options',
				name: 'options',
				placeholder: 'Enter options (press Enter to add)',
				required: true
			},
			{ type: 'text', label: 'Placeholder', name: 'placeholder', placeholder: 'Select an option' }
		]
	},
	{
		type: 'select',
		label: 'Multi-Select',
		icon: '📋',
		properties: [
			{ type: 'checkbox', label: 'Required Field', name: 'required' },
			// { type: 'text', label: 'Default Value', name: 'default', value: 'default' },
			{ type: 'hidden', name: 'multiple', value: true },
			{
				type: 'tags',
				label: 'Options',
				name: 'options',
				placeholder: 'Enter options (press Enter to add)'
			},
			{ type: 'text', label: 'Placeholder', name: 'placeholder', placeholder: 'Select options' }
		]
	},
	{
		type: 'file',
		label: 'File',
		icon: '🗂️',
		properties: [
			{ type: 'checkbox', label: 'Multiple Files', name: 'multiple' },
			{
				type: 'text',
				label: 'Accept',
				name: 'accept',
				placeholder: 'File types (e.g., image/*,.pdf)'
			}
		]
	},
	{
		type: 'file',
		label: 'Photo',
		icon: '🖼️',
		properties: [
			{ type: 'checkbox', label: 'Multiple Images', name: 'multiple' },
			{ type: 'checkbox', label: 'Required Field', name: 'required' }
		]
	},
	{
		type: 'file',
		label: 'Video',
		icon: '🎞️',
		properties: [
			{ type: 'checkbox', label: 'Multiple Videos', name: 'multiple' },
			{ type: 'checkbox', label: 'Required Field', name: 'required' },
			{ type: 'text', label: 'Accept', name: 'accept', placeholder: 'Video types (e.g., video/*)' }
		]
	}
] satisfies ConfiguratorInput[];

export type ConfiguratorInput = Omit<InputType, 'name'> & {
	icon?: string;
	properties: InputType[];
	[key: string]: any;
};

export async function Check<Schema extends InputType[] = InputType[]>(
	schema: Schema,
	lookup: (schema: InputType) => MaybePromise<any | undefined>
): Promise<Record<Schema[number]['name'], any>> {
	// Dynamically collect the settings from the form based on the schema
	const dynamicConfig: Record<string, any> = {};
	const errors: Error[] = [];

	// Loop through each setting in the schema and retrieve corresponding values from the form
	for (const input of schema) {
		const formValue = await lookup(input);
		if (formValue || ('default' in input && input.default))
			dynamicConfig[input.name] = formValue || ('default' in input ? input.default : undefined);

		// Optionally handle validation, e.g., required fields
		if (input.required && !dynamicConfig[input.name])
			errors.push(new Error(`${input.name} is required`));
	}
	if (errors.length > 0) throw errors;
	return dynamicConfig;
}
