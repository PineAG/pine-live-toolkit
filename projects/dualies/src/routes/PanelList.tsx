import { ButtonBase, Card, Grid } from "@mui/material"
import { ReactElement } from "react"
import { useNavigate } from "react-router-dom"
import Loading from "../components/Loading"
import { useGlobal } from "../store"
import "./PanelList.css"


type PageListButtonProps = {
    onClick: () => void
    children: ReactElement
}
const ListButton = (props: PageListButtonProps) => {
    return <Grid xs={4} lg={2}>
        <ButtonBase onAnimationEnd={props.onClick}>
            <Card className="list-button">
                {props.children}
            </Card>
        </ButtonBase>
    </Grid>
}

export const PanelListPage = () => {
    const navigate = useNavigate()
    const store = useGlobal()
    if(!store){
        return <Loading/>
    }
    return <Grid container>
        {store.panels.map(p => (
            <ListButton onClick={() => navigate(`/panel/${p.id}`)}>
                <div>
                    {p.title}
                </div>
            </ListButton>
        ))}
    </Grid>
}
