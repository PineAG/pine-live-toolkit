import {Spin} from "antd"
import { LoadingOutlined } from "@ant-design/icons"


export function Loading() {
    const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin/>
    return <Spin indicator={loadingIcon}/>
}