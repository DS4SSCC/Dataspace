export const session = new (class Session {
	private _data = $state<NonNullable<App.Locals['session']>>();
	public meta = $state<NonNullable<App.Locals['session']>['meta']>();

	public readonly user_id = $derived(this._data?.user_id);

	public readonly user = $derived(this?._data?.user);

	load(input: NonNullable<App.Locals['session']>) {
		this._data = input;
		this.meta = input.meta;
		return this;
	}
})();
