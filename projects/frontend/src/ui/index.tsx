import { InternationalProvider, SupportedLanguages } from '@pltk/components';
import { RouterRoot } from './routes';
import { BackendProvider, BackendOptions } from "./backend";
import { EnabledWidgetProvider, WidgetDefinition } from './configurable';

export interface LiveToolkitAppProps {
    backend: BackendOptions
    language: SupportedLanguages
    plugins: WidgetDefinition<any>[]
}

export function LiveToolkit(props: LiveToolkitAppProps) {
    return <BackendProvider fileStorage={props.backend.fileStorage} client={props.backend.client} subscription={props.backend.subscription}>
      <InternationalProvider language={props.language}>
        <EnabledWidgetProvider widgets={props.plugins}>
          <RouterRoot/>
        </EnabledWidgetProvider>
      </InternationalProvider>
    </BackendProvider>
}

export * from "./backend"
export * from "./configurable"