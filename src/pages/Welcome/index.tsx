import PageContainer from "../../components/PageContainer";
import './index.css'
import {Button, Col, Image, Row} from "antd";
import {useNavigate} from "react-router-dom";
import {open} from "@tauri-apps/api/dialog";
import ProjectConfig from "../../models/Project.ts";
import SvgLogo from './../../assets/logo.svg'

/**
 * 欢迎页面
 */
export default function WelcomePage() {

    const navigateFn = useNavigate();

    // 打开项目
    const openProject = async () => {

        const filePath = await open({
            multiple: false,
            directory: false,
            title: "选择Spring Generate工程",
            filters: [{
                name: "Spring Generate工程",
                extensions: ["sg.json"]
            }]
        });
        if (filePath == null) {
            return
        }
        await ProjectConfig.loadWithPath(filePath as string)
        navigateFn("/table-edit")
    }

    return <PageContainer>
        <Row align='middle' style={{height: "100%"}}>
            <Row style={{width: '100%'}} justify='center'>
                <Col span={24}>
                    <Row justify='center'>
                        <Image preview={false} src={SvgLogo} width={350}/>
                    </Row>
                    <Row justify='center' style={{fontSize: '35px', fontWeight: 'bold', marginTop: "35px"}}>Spring
                        Generate</Row>
                    <Row justify='center' style={{fontSize: '20px', fontWeight: 'bold', marginTop: "15px"}}>- 为快速开发而生 -</Row>
                </Col>
                <Col span={24}>
                    <Row justify='center' style={{marginTop:"100px"}}>
                        <Button className='welcome-button' type='primary' onClick={() => {
                            navigateFn("/new-project")
                        }}>新建项目</Button>
                        <Button className='welcome-button' style={{marginLeft: '20px'}}
                                onClick={openProject}>打开项目</Button>
                    </Row>
                </Col>
            </Row>
        </Row>
        <Row style={{position:'fixed',bottom:'5px',width:'100%'}} justify='center'>version 1.0.0 build version:47cd76e43.f74bbc2e1baa.f194d07e1fa</Row>
    </PageContainer>
}