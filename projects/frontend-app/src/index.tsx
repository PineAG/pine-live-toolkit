import { InternationalProvider, SupportedLanguages } from '@pltk/components';
import { RouterRoot } from './routes';
import { BackendProvider, BackendOptions } from "@pltk/core";
import { EnabledWidgetProvider, WidgetDefinition } from '@pltk/core';

export interface LiveToolkitAppProps {
    backend: BackendOptions
    language: SupportedLanguages
    plugins: WidgetDefinition<any>[]
}

export function LiveToolkitApp(props: LiveToolkitAppProps) {
    return <BackendProvider fileStorage={props.backend.fileStorage} client={props.backend.client} subscription={props.backend.subscription}>
      <InternationalProvider language={props.language}>
        <EnabledWidgetProvider widgets={props.plugins}>
          <RouterRoot/>
        </EnabledWidgetProvider>
      </InternationalProvider>
    </BackendProvider>
}
