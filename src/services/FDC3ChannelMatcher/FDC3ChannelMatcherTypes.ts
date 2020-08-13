interface Listener {
	unsubscribe(): void;
}

interface ProviderChannel {
	inbound: string | null;
	outbound: string | null;
}

interface Provider {
	[providerName: string]: ProviderChannels;
}

interface ProviderChannels {
	[providerFDC3ChannelName: string]: ProviderChannel;
}
interface ThirdPartyProviders {
	providers: Provider;
}

interface StateProviderChannel extends ProviderChannel {
	inboundListener?: Listener;
	outboundListener?: Listener;
}