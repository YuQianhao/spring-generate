import React from "react";
import {Button} from "antd";
import {useNavigate} from "react-router-dom";


export default function Header() {

    const navigateFn = useNavigate();

    const bodyCss: React.CSSProperties = {
        position: "fixed",
        width: "100%",
        height: "60px",
        top: "0",
        left: "0",
        zIndex: 2,
        backgroundColor: "#ffffff",
        borderBottom: "solid #f5f5f5 1px",
    }


    return <div style={bodyCss}>
        <h3 style={{lineHeight: '60px', margin: '0', paddingLeft: '20px', float: 'left'}}>新建项目</h3>
        <Button style={{float: 'right', marginRight: '30px',  marginTop:'15px'}} type='link' onClick={()=>{
            navigateFn(-1)
        }}>取消</Button>
    </div>
}