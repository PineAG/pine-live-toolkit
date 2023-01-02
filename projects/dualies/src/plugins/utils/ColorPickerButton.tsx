import { DStore } from "@dualies/components"
import { ButtonBase, FormControl, Grid, InputLabel, Popover, Typography } from "@mui/material"
import { Box, Stack } from "@mui/system"
import { useRef, useState } from "react"
import { CompactPicker, SwatchesPicker } from "react-color"

export interface ColorPreviewProps {
    color: string
}

export function ColorPreview({ color }: ColorPreviewProps) {
    return <div style={{
        width: "50px",
        height: "20px",
        backgroundColor: color,
        borderRadius: "5px",
        boxShadow: "inset 0px 0px 3px #888"
    }} />
}

export interface ColorPickerButtonProps {
    label: string
    store: DStore<string>
}

export function ColorPickerButton(props: ColorPickerButtonProps) {
    const ref = useRef(null)
    const [open, setOpen] = useState(false)
    const popover = !ref.current ? null : (
            <Popover anchorEl={ref.current} open={open} onClose={() => setOpen(false)}>
                <CompactPicker color={props.store.value} onChange={res => {
                    props.store.update(res.hex)
                    setOpen(false)
                }} />
            </Popover>
    )
    return <Grid container style={{marginTop: "10px", marginBottom: "10px"}}>
        <Grid xs={3} style={{display: "grid", placeItems: "center", color: "rgba(0, 0, 0, 0.6)"}}>
            <Typography style={{fontSize: "0.8rem"}}>{props.label}</Typography>
        </Grid>
        <Grid xs={1}/>
        <Grid xs={8}>
            <ButtonBase ref={ref} onClick={() => setOpen(true)}>
                <ColorPreview color={props.store.value} />
            </ButtonBase>
            {popover}
        </Grid>
    </Grid>
}