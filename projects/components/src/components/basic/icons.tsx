import * as icons from "@ant-design/icons"

const iconSizeMapping = {
    small: 32,
    middle: 48,
    large: 64
}

export interface IconProps {
    size?: keyof typeof iconSizeMapping
    color?: string
}

const warpIcon = (Icon: typeof icons.PlusOutlined) => (props: IconProps) => (
    <Icon
        style={{
            fontSize: props.size && iconSizeMapping[props.size],
            color: props.color
        }}
    />
)

export const Add = warpIcon(icons.PlusOutlined)
export const Edit = warpIcon(icons.EditOutlined)
export const Delete = warpIcon(icons.DeleteOutlined)
export const Ok = warpIcon(icons.CheckOutlined)
export const Close = warpIcon(icons.CloseOutlined)
export const Minimize = warpIcon(icons.LineOutlined)
export const Move = warpIcon(icons.DragOutlined)
export const Share = warpIcon(icons.ShareAltOutlined)
export const Show = warpIcon(icons.EyeOutlined)
export const Hide = warpIcon(icons.EyeInvisibleOutlined)
export const Pending = warpIcon(icons.ClockCircleOutlined)
export const Completed = warpIcon(icons.CheckOutlined)
export const Up = warpIcon(icons.ArrowUpOutlined)
export const Down = warpIcon(icons.ArrowDownOutlined)
export const Upload = warpIcon(icons.UploadOutlined)
export const Image = warpIcon(icons.PictureOutlined)
export const Save = warpIcon(icons.SaveOutlined)
