import React from "react";

/**
 * 页面容器
 */
export default function PageContainer(props: React.HTMLAttributes<HTMLElement>) {
    return <div style={{height: '100%', width: '100%', overflow: 'hidden', zIndex: 1}}>
        {props.children}
    </div>
}