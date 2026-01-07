import 'matter-js';

declare module 'matter-js' {
    interface IBodyRenderOptions {
        text?: {
            content: string;
            color: string;
            size: number;
            family: string;
        };
    }
}
