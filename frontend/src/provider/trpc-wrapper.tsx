"use client";

import {useState} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
export interface TrpcWrapperProps {
	children: React.ReactNode;
}

import {httpBatchLink, loggerLink} from "@trpc/client";
import {baseURl} from "@/constant/env";
import {fetcher, getAccessToken} from "@/trpc/utils/refreshHeaderToken";
import {trpc} from "@/trpc/client";
import {CookiesProvider} from "react-cookie";
export function TrpcWrapper(props: TrpcWrapperProps) {
	const {children} = props;
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						retry: 0,
						staleTime: 60 * 1000,
					},
				},
			})
	);

	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				loggerLink({
					enabled: opts =>
						(process.env.NODE_ENV === "development" && typeof window !== "undefined") || (opts.direction === "down" && opts.result instanceof Error),
				}),

				httpBatchLink({
					url: baseURl,
					fetch: fetcher,
					async headers() {
						const accessToken = getAccessToken();
						return {
							authorization: accessToken ? `Bearer ${accessToken}` : "",
						};
					},
				}),
			],
		})
	);

	return (
		<CookiesProvider>
			<trpc.Provider client={trpcClient} queryClient={queryClient}>
				<QueryClientProvider client={queryClient}>
					{children}
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
			</trpc.Provider>
		</CookiesProvider>
	);
}
