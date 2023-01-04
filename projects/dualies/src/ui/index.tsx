import { InternationalProvider, SupportedLanguages } from '@dualies/components';
import { EnabledPluginProvider, Plugin } from './components/plugins';
import { RouterRoot } from './routes';
import { BackendProvider, IBackend } from "./store";

export interface DualiesAppProps {
    backend: IBackend
    language: SupportedLanguages
    plugins: Plugin<any>[]
}

export function DualiesApp(props: DualiesAppProps) {
    return <BackendProvider value={props.backend}>
      <InternationalProvider language={props.language}>
        <EnabledPluginProvider value={props.plugins}>
          <RouterRoot/>
        </EnabledPluginProvider>
      </InternationalProvider>
    </BackendProvider>
}

export type {IBackend, Rect, Size, PluginInfo, PanelInfo, PluginMeta, PanelMeta} from "./store"
export {BrowserStorageBackend} from "./store"
export type { Plugin, PropsWithConfig } from './components/plugins'
export * from "./store"
