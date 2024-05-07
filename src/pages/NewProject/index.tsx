import {Button, Form, Input, InputNumber, message, Modal, Radio, Steps} from "antd";
import './index.css'
import TextArea from "antd/lib/input/TextArea";
import {useEffect, useState} from "react";
import {AppstoreAddOutlined, LinkOutlined} from "@ant-design/icons";
import ProjectConfig, {DatabaseEngineType, DatabaseType} from "../../models/Project.ts";
import {open} from "@tauri-apps/api/dialog";
import {Files} from "../../libs/file.ts";
import Database from "tauri-plugin-sql-api";
import PageContainer from "../../components/PageContainer";
import Header from "../../components/Header";
import {useNavigate} from "react-router-dom";

type ProjectSlot = {

    config: ProjectConfig;

    updateConfigFn: (config: ProjectConfig) => void;

}

/**
 * 项目完成页面
 */
function ProjectCompleteCard({config}: ProjectSlot) {

    const [loading, setLoading] = useState(false);
    const [modalApi, modalHolder] = Modal.useModal()

    const navigateFn = useNavigate();

    const errorDialog = (content: string) => {
        modalApi.error({title: "代码生成", content: content, okText: "好的"})
    }

    /**
     * 初始化项目
     */
    const initialize = async () => {
        setLoading(true)
        try {
            await config.initialize()
            navigateFn(-1);
            Modal.success({
                title: "Spring Generate", content: "项目创建成功。", okText: "好的"
            })
        } catch (error: any) {
            errorDialog(error.message)
        }
        setLoading(false)
    }

    let databaseFieldTypeElement = <></>
    if (config.databaseFieldType === 0) {
        databaseFieldTypeElement = <span>默认</span>
    } else if (config.databaseFieldType === 1) {
        databaseFieldTypeElement = <span>全大写</span>
    } else if (config.databaseFieldType === 2) {
        databaseFieldTypeElement = <span>全小写</span>
    }

    return <div>
        {modalHolder}
        <Form labelCol={{span: 5}}>
            <Form.Item label='项目名称'>
                {config.projectName}
            </Form.Item>
            <Form.Item label='项目包名'>
                {config.packageName}
            </Form.Item>
            <Form.Item label='项目描述'>
                {config.description}
            </Form.Item>
            <Form.Item label='项目路径'>
                {config.projectPath}
            </Form.Item>
            <Form.Item label='数据库引擎'>
                {config.databaseType === 0 ? 'MySQL' : 'TiDB'}
            </Form.Item>
            <Form.Item label='数据库ORM'>
                {config.databaseOrm === 0 ? 'MyBatis-Plus' : 'JPA'}
            </Form.Item>
            <Form.Item label='数据库名称'>
                {config.databaseName}
            </Form.Item>
            <Form.Item label='数据库Host'>
                {config.databaseHost}
            </Form.Item>
            <Form.Item label='数据库Port'>
                {config.databasePort}
            </Form.Item>
            <Form.Item label='数据库用户'>
                {config.databaseUser}
            </Form.Item>
            <Form.Item label='数据库密码'>
                {config.databasePassword}
            </Form.Item>
            <Form.Item label='SQL表结构大写'>
                {databaseFieldTypeElement}
            </Form.Item>
            <Form.Item label='数据库前缀'>
                {config.databaseFieldPrefix}
            </Form.Item>
            <Form.Item label='生成时备份'>
                {config.generateBackup ? '启用' : '不启用'}
            </Form.Item>
            <Form.Item label='分页参数字段'>
                {config.pageFieldName}
            </Form.Item>
            <Form.Item label='分页长度字段'>
                {config.pageSizeFieldName}
            </Form.Item>
            <Form.Item wrapperCol={{offset: 4}}>
                <Button icon={<AppstoreAddOutlined/>} loading={loading} type='primary' onClick={initialize}
                        style={{height: '45px', width: '200px', marginBottom: '100px'}}>创建项目</Button>
            </Form.Item>
        </Form>
    </div>
}

/**
 * 代码生成设置
 */
function CodeGenerateSettingCard({config, updateConfigFn}: ProjectSlot) {

    const [form] = Form.useForm()

    const changeUpdateProjectFn = () => {
        updateConfigFn(config)
    }

    useEffect(() => {
        form.setFieldsValue({
            "databaseFieldType": config.databaseFieldType,
            "databaseFieldPrefix": config.databaseFieldPrefix,
            "pageFieldName": config.pageFieldName,
            "generateBackup": config.generateBackup,
            "pageSizeFieldName": config.pageSizeFieldName,
        })
    }, [])

    return <Form labelCol={{span: 6}} wrapperCol={{span: 15}} form={form}>
        <Form.Item label='数据库字段大写' name='databaseFieldType'>
            <Radio.Group optionType="button" buttonStyle="solid" onChange={(e) => {
                config.databaseFieldType = e.target.value
                changeUpdateProjectFn()
            }} options={[
                {
                    label: "默认",
                    value: 0
                },
                {
                    label: "全大写",
                    value: 1
                },
                {
                    label: "全小写",
                    value: 2
                },
            ]}>
            </Radio.Group>
        </Form.Item>
        <Form.Item label='数据库字段前缀' wrapperCol={{span: 6}} name='databaseFieldPrefix'>
            <Input onChange={(e) => {
                config.databaseFieldPrefix = e.target.value
                changeUpdateProjectFn()
            }}/>
        </Form.Item>
        <Form.Item label='生成时备份' name='generateBackup'>
            <Radio.Group optionType="button" buttonStyle="solid" onChange={(e) => {
                config.generateBackup = e.target.value
                changeUpdateProjectFn()
            }} options={[
                {
                    label: "启用",
                    value: true
                },
                {
                    label: "禁用",
                    value: false
                }
            ]}>

            </Radio.Group>
        </Form.Item>
        <Form.Item label='分页页码字段' wrapperCol={{span: 6}} name='pageFieldName'>
            <Input onChange={(e) => {
                config.pageFieldName = e.target.value
                changeUpdateProjectFn()
            }}/>
        </Form.Item>
        <Form.Item label='分页数据长度字段' wrapperCol={{span: 6}} name='pageSizeFieldName'>
            <Input onChange={(e) => {
                config.pageSizeFieldName = e.target.value
                changeUpdateProjectFn()
            }}/>
        </Form.Item>
    </Form>
}

/**
 * 数据库设置
 */
function DatabaseSettingCard({config, updateConfigFn}: ProjectSlot) {

    const [modalApi, modalHolder] = Modal.useModal()
    const [form] = Form.useForm()

    const [connectLoading, setConnectLoading] = useState<boolean>(false);

    const setFormValues = () => {
        form.setFieldsValue({
            "databaseOrm": config.databaseOrm,
            "databaseType": config.databaseType,
            "databaseName": config.databaseName,
            "databaseHost": config.databaseHost,
            "databasePort": config.databasePort,
            "databaseUser": config.databaseUser,
            "databasePassword": config.databasePassword,
        })
    }

    const warningDialog = (content: string) => {
        modalApi.warning({title: "数据库连接测试", content: content, okText: "好的"})
    }

    const errorDialog = (content: string) => {
        modalApi.error({title: "数据库连接测试", content: content, okText: "好的"})
    }

    const successDialog = (content: string) => {
        modalApi.success({title: "数据库连接测试", content: content, okText: "好的"})
    }

    // 数据库连接测试
    const connectTest = async () => {
        if (config.databaseName.length == 0) {
            warningDialog("数据库名格式不正确。")
            return
        }
        if (config.databaseHost.length == 0) {
            warningDialog("数据库Host格式不正确。")
            return
        }
        if (config.databasePort == null) {
            warningDialog("数据库端口号t格式不正确。")
            return
        }
        if (config.databaseUser.length == 0) {
            warningDialog("数据库用户名格式不正确。")
            return
        }
        if (config.databasePassword.length == 0) {
            warningDialog("数据库密码格式不正确。")
            return
        }
        setConnectLoading(true)
        // 测试连接
        Database.load(`mysql://${config.databaseUser}:${config.databasePassword}@${config.databaseHost}:${config.databasePort}/${config.databaseName}`).then(() => {
            successDialog("数据库连接成功。")
        }).catch((error) => {
            errorDialog("数据库连接失败。" + error)
        }).finally(() => {
            setConnectLoading(false)
        })
    }

    const refreshProjectConfigFn = () => {
        updateConfigFn(config)
    }

    useEffect(() => {
        setFormValues()
    }, [])

    return <Form labelCol={{span: 3}} wrapperCol={{span: 8}} form={form}>
        {modalHolder}
        <Form.Item label='引擎' name='databaseType'>
            <Radio.Group
                options={[
                    {
                        label: "MySQL",
                        value: DatabaseType.MySQL
                    },
                    {
                        label: "TiDB",
                        value: DatabaseType.TiDB,
                        disabled: true,
                    }
                ]}
                onChange={(e) => {
                    config.databaseType = e.target.value
                    refreshProjectConfigFn()
                }}
                optionType="button"
                buttonStyle="solid"
            />
        </Form.Item>
        <Form.Item label='ORM' name='databaseOrm'>
            <Radio.Group
                options={[
                    {
                        label: "MyBatis Plus",
                        value: DatabaseEngineType.MyBatisPlus
                    },
                    {
                        label: "JPA",
                        value: DatabaseEngineType.JPA,
                        disabled: true,
                    }
                ]}
                onChange={(e) => {
                    config.databaseOrm = e.target.value
                    refreshProjectConfigFn()
                }}
                optionType="button"
                buttonStyle="solid"
            />
        </Form.Item>
        <Form.Item label='数据库名' name='databaseName'>
            <Input onChange={(e) => {
                config.databaseName = e.target.value
                refreshProjectConfigFn()
            }}/>
        </Form.Item>
        <Form.Item label='Host' name='databaseHost'>
            <Input onChange={(e) => {
                config.databaseHost = e.target.value
                refreshProjectConfigFn()
            }}/>
        </Form.Item>
        <Form.Item label='Port' name='databasePort'>
            <InputNumber onChange={(value) => {
                config.databasePort = value == null ? 0 : Number(value.toString())
                refreshProjectConfigFn()
            }}/>
        </Form.Item>
        <Form.Item label='User' name='databaseUser'>
            <Input onChange={(e) => {
                config.databaseUser = e.target.value
                refreshProjectConfigFn()
            }}/>
        </Form.Item>
        <Form.Item label='Password' name='databasePassword'>
            <Input onChange={(e) => {
                config.databasePassword = e.target.value
                refreshProjectConfigFn()
            }}/>
        </Form.Item>
        <Form.Item wrapperCol={{offset: 3}}>
            <Button loading={connectLoading} icon={<LinkOutlined/>} onClick={connectTest}>测试连接</Button>
        </Form.Item>
    </Form>
}

/**
 * 项目设置
 */
function ProjectSettingCard({config, updateConfigFn}: ProjectSlot) {

    const [messageApi, messageHolder] = message.useMessage()

    const [form] = Form.useForm()

    /**
     * 更新Form的值
     */
    const refreshFormValues = () => {
        form.setFieldsValue({
            "projectName": config.projectName,
            "packageName": config.packageName,
            "description": config.description,
            "projectPath": config.projectPath,
        })
    }

    useEffect(() => {
        refreshFormValues()
    }, [])

    /**
     * 更新项目配置
     */
    const changeConfigUpdate = () => {
        updateConfigFn(config)
    }

    const selectProjectPath = async () => {
        const file = await open({
            multiple: false,
            directory: false,
            title: "选择Spring Boot工程",
            filters: [{
                name: "Spring Boot工程",
                extensions: ["gradle", "xml"]
            }]
        });
        if (file !== null) {
            const fileName = file.toString();
            if (!fileName.endsWith("build.gradle") && !fileName.endsWith("pom.xml")) {
                messageApi.warning({content: "您选择的不是 'Spring Boot' 的工程配置文件，配置文件通常是 'build.gradle' ， 或者是 'pom.xml' 。"})
                return
            }
            config.projectPath = Files.getParentPath(file.toString())
            changeConfigUpdate()
            refreshFormValues()
        }
    }

    return <Form wrapperCol={{span: 16}} form={form}>
        {messageHolder}
        <Form.Item label='项目名称' wrapperCol={{span: 16}} name={'projectName'}>
            <Input onChange={(e) => {
                config.projectName = e.target.value
                changeConfigUpdate()
            }}/>
        </Form.Item>
        <Form.Item label='项目包名' wrapperCol={{span: 16}} name={'packageName'}>
            <Input onChange={(e) => {
                config.packageName = e.target.value
                changeConfigUpdate()
            }}/>
        </Form.Item>
        <Form.Item label='项目描述' wrapperCol={{span: 16}} name={'description'}>
            <TextArea rows={3} maxLength={255} onChange={(e) => {
                config.description = e.target.value
                changeConfigUpdate()
            }}/>
        </Form.Item>
        <Form.Item label='项目路径' wrapperCol={{span: 16}} name={'projectPath'}>
            <Input disabled placeholder='请选择项目的路径'/>
        </Form.Item>
        <Form.Item wrapperCol={{offset: 3}}>
            <Button type="primary" onClick={selectProjectPath}>选择</Button>
        </Form.Item>
    </Form>
}

/**
 * 新建项目页面
 */
export default function NewProjectPage() {

    const [stepIndex, setStepIndex] = useState(0);

    const [projectConfig, setProjectConfig] = useState<ProjectConfig>(new ProjectConfig());

    let contentElement = <></>
    if (stepIndex == 0) {
        contentElement =
            <ProjectSettingCard config={projectConfig} updateConfigFn={setProjectConfig}></ProjectSettingCard>
    } else if (stepIndex == 1) {
        contentElement =
            <DatabaseSettingCard config={projectConfig} updateConfigFn={setProjectConfig}></DatabaseSettingCard>
    } else if (stepIndex == 2) {
        contentElement =
            <CodeGenerateSettingCard config={projectConfig} updateConfigFn={setProjectConfig}></CodeGenerateSettingCard>
    } else if (stepIndex == 3) {
        contentElement =
            <ProjectCompleteCard config={projectConfig} updateConfigFn={setProjectConfig}></ProjectCompleteCard>
    }


    return <PageContainer>
        <Header/>
        <div className='new-project-body'>
            <Steps
                className='new-project-steps'
                direction='vertical'
                progressDot
                onChange={(index) => {
                    setStepIndex(index)
                }}
                current={stepIndex}
                items={[
                    {
                        title: '项目设置',
                    },
                    {
                        title: '数据库',
                    },
                    {
                        title: '代码生成',
                    },
                    {
                        title: '完成',
                    },
                ]}
            />
            <div className='new-project-content'>
                {contentElement}
            </div>
        </div>
    </PageContainer>
}