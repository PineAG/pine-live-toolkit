import { HashRouter, Route, Routes } from "react-router-dom";
import { PanelPage } from "./Panel";
import { PanelExhibitionPage } from "./PanelExhibition";
import { PanelListPage } from "./PanelList";


export const RouterRoot = () => {
    return <HashRouter>
        <Routes>
            <Route
                path="/panel/:panelId/exhibition"
                element={<PanelExhibitionPage/>}
            />
            <Route
                path="/panel/:panelId"
                element={<PanelPage/>}
            />
            <Route
                path="/"
                element={<PanelListPage/>}
            />
        </Routes>
    </HashRouter>
}
