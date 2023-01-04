import { LoadingOutlined } from "@ant-design/icons"
import { Spin } from "antd"


export function Loading() {
    const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin/>
    return <Spin indicator={loadingIcon}/>
}