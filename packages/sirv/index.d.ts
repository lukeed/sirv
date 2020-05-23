declare module 'sirv' {
	import type { Stats } from 'fs';
	import type { IncomingMessage, ServerResponse } from 'http';

	export type NextHandler = VoidFunction | Promise<void>;
	export type RequestHandler = (req: IncomingMessage, res: ServerResponse, next?: NextHandler) => void;

	export interface Options {
		dev?: boolean;
		maxAge?: number;
		immutable?: boolean;
		extensions?: string[];
		dotfiles?: boolean;
		single?: string | boolean;
		onNoMatch?: (req: IncomingMessage, res: ServerResponse) => void;
		setHeaders?: (res: ServerResponse, pathname: string, stats: Stats) => void;
	}

	export default function (dir?: string, opts?: Options): RequestHandler;
}
