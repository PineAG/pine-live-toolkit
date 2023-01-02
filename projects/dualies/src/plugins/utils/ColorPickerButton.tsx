import { DBinding, Grid } from "@dualies/components"
import { ButtonBase, Popover } from "@mui/material"
import { useRef, useState } from "react"
import { CompactPicker } from "react-color"

export interface ColorPreviewProps {
    color: string
}

export function ColorPreview({ color }: ColorPreviewProps) {
    return <div style={{
        width: "2rem",
        height: "1.5rem",
        backgroundColor: color,
        borderRadius: "5px",
        boxShadow: "inset 0px 0px 3px #888"
    }} />
}

export interface ColorPickerButtonProps {
    store: DBinding<string>
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
    return <Grid container>
        <Grid span={12}>
            <ButtonBase ref={ref} onClick={() => setOpen(true)}>
                <ColorPreview color={props.store.value} />
            </ButtonBase>
            {popover}
        </Grid>
    </Grid>
}