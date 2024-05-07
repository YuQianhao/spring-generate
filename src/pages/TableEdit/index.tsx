import PageContainer from "../../components/PageContainer";
import './index.css'
import {Button, Col, Form, Input, Menu, Modal, Row, Select, Space, Table, TableProps, Tag} from "antd";
import {useNavigate} from "react-router-dom";
import TextArea from "antd/lib/input/TextArea";
import {AppstoreAddOutlined, CodeOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {
    ObjectField, ObjectFieldIndex, ObjectFieldSaveMode, ObjectFieldSelectMode, ObjectFieldType,
} from "../../models/ObjectField.ts";
import EditObjectTableDialog from "./components/EditObjectTableDialog.tsx";
import {ObjectTable} from "../../models/ObjectTable.ts";
import ProjectConfig, {DatabaseEngineType, DatabaseType} from "../../models/Project.ts";
import {MenuItemType} from "antd/lib/menu/hooks/useItems";
import {CodeGenerate, CodeGenerateType} from "../../generate/CodeGenerate.ts";


export class ObjectFieldEditCache {

    /**
     * 当前正在等待编辑的字段
     */
    static CurrentEditObjectField: ObjectField = new ObjectField()

}

type TableEditContentSlot = {

    project: ProjectConfig;

    objectTable: ObjectTable;

    // 更新表结构函数
    changeObjectTableFn: (record: ObjectTable) => void;

    // 删除表结构
    deleteTableFn: (record: ObjectTable) => void;

}

/**
 * 表结构编辑器
 */
function TableEditContent({project, objectTable, changeObjectTableFn, deleteTableFn}: TableEditContentSlot) {

    const [modalApi, modalHolder] = Modal.useModal()
    const [editDialogShow, setEditDialogShow] = useState(false)

    // 生成类型
    const [generateTypes, setGenerateTypes,] = useState<string[]>([
        CodeGenerateType.java, CodeGenerateType.database, CodeGenerateType.document,
    ])

    // 生成日志
    const [generateLog, setGenerateLog] = useState<string>("");

    const defineColumns: TableProps['columns'] = [
        {
            key: "fieldName",
            dataIndex: "fieldName",
            title: "字段",
            fixed: 'left',
        },
        {
            key: "fieldCnName",
            dataIndex: "fieldCnName",
            title: "中文说明",
        },
        {
            key: "fieldType",
            dataIndex: "fieldType",
            title: "数据类型",
            align: "center",
            render: (_: any, record: ObjectField) => {
                switch (record.fieldType) {
                    case ObjectFieldType.Integer:
                        return <Tag key={`fieldType-` + record.id} color="magenta">Integer</Tag>
                    case ObjectFieldType.Double:
                        return <Tag key={`fieldType-` + record.id} color="magenta">Double</Tag>
                    case ObjectFieldType.Char:
                        return <Tag key={`fieldType-` + record.id}
                                    color="volcano">{`Char (${record.fieldLength}) `}</Tag>
                    case ObjectFieldType.Varchar:
                        return <Tag key={`fieldType-` + record.id}
                                    color="red">{`Varchar (${record.fieldLength}) `}</Tag>
                    case ObjectFieldType.Boolean:
                        return <Tag key={`fieldType-` + record.id} color="gold">Boolean</Tag>
                    case ObjectFieldType.DateTime:
                        return <Tag key={`fieldType-` + record.id} color="lime">DateTime</Tag>
                    default:
                        return <Tag key={`fieldType-` + record.id}>未知类型</Tag>
                }
            }
        },
        {
            key: "indexType",
            dataIndex: "indexType",
            title: "索引",
            align: "center",
            width: 75,
            render: (_: any, record: ObjectField) => {
                if (record.indexType === ObjectFieldIndex.None) {
                    return <Tag key={`indexType-` + record.id}>不启用</Tag>
                } else if (record.indexType === ObjectFieldIndex.Index) {
                    return <Tag key={`indexType-` + record.id} color="cyan">Index</Tag>
                } else if (record.indexType === ObjectFieldIndex.Unique) {
                    return <Tag key={`indexType-` + record.id} color="blue">Unique</Tag>
                }
            }
        },
        {
            key: "allowNull",
            dataIndex: "allowNull",
            title: "允许空",
            align: 'center',
            width: 75,
            render: (_: any, record: ObjectField) => {
                if (record.allowNull) {
                    return <Tag key={`allowNull-` + record.id} color='green'>是</Tag>
                } else {
                    return <Tag key={`allowNull-` + record.id} color='red'>否</Tag>
                }
            }
        },
        {
            key: "lengthLimit",
            dataIndex: "lengthLimit",
            title: "长度限制",
            align: 'center',
            render: (_: any, record: ObjectField) => {
                if (!ObjectField.typeIsText(record.fieldType)) {
                    return <span key={`lengthLimit-` + record.id}>-</span>
                } else {
                    return <span key={`lengthLimit-` + record.id}>{`${record.minLength} - ${record.maxLength}`}</span>
                }
            }
        },
        {
            key: "valueLimit",
            dataIndex: "valueLimit",
            title: "值区间",
            align: 'center',
            render: (_: any, record: ObjectField) => {
                if (record.id === 0 && record.primaryKey) {
                    return <Tag>跟随系统</Tag>
                }
                if (!ObjectField.typeIsNumber(record.fieldType)) {
                    return <span key={`valueLimit-` + record.id}>-</span>
                } else {
                    return <span key={`valueLimit-` + record.id}>{`${record.minValue} - ${record.maxValue}`}</span>
                }
            }
        },
        {
            key: "selectType",
            dataIndex: "selectType",
            title: "查询接口规则",
            align: 'center',
            render: (_: any, record: ObjectField) => {
                switch (record.selectType) {
                    case ObjectFieldSelectMode.None:
                        return <Tag key={`selectType-` + record.id}>不启用</Tag>
                    case ObjectFieldSelectMode.Equal:
                        return <Tag key={`selectType-` + record.id} color="green">Equal</Tag>
                    case ObjectFieldSelectMode.Like:
                        return <Tag key={`selectType-` + record.id} color="geekblue">Like</Tag>
                    case ObjectFieldSelectMode.Range:
                        return <Tag key={`selectType-` + record.id} color="purple">Range</Tag>
                    default:
                        return <Tag key={`selectType-` + record.id}>未知</Tag>
                }
            }
        },
        {
            key: "saveParamsType",
            dataIndex: "saveParamsType",
            title: "保存接口规则",
            align: 'center',
            render: (_: any, record: ObjectField) => {
                switch (record.saveParamsType) {
                    case ObjectFieldSaveMode.None:
                        return <Tag key={`saveParamsType-` + record.id}>不启用</Tag>
                    case ObjectFieldSaveMode.OnlyAllSave:
                        return <Tag key={`saveParamsType-` + record.id} color="#669900">Unified</Tag>
                    case ObjectFieldSaveMode.OnlySingleSave:
                        return <Tag key={`saveParamsType-` + record.id} color="#008ae6">Single</Tag>
                    case ObjectFieldSaveMode.AllAndSingleSave:
                        return <Tag key={`saveParamsType-` + record.id} color="#8a00e6">All</Tag>
                    default:
                        return <Tag key={`saveParamsType-` + record.id}>未知</Tag>
                }
            }
        },
        {
            key: "comments",
            dataIndex: "comments",
            title: "注释说明",
            width: 400,
        },
        {
            key: "operate",
            dataIndex: "operate",
            title: "操作",
            align: 'center',
            fixed: 'right',
            render: (_: any, record: ObjectField) => {
                if (record.id === 0 && record.primaryKey) {
                    return <Tag>默认主键无法修改</Tag>
                }
                return <Row key={`operate-` + record.id}>
                    <Col span={12}>
                        <Button type='link' onClick={() => {
                            console.log(record)
                            ObjectFieldEditCache.CurrentEditObjectField = record
                            setEditDialogShow(true)
                        }}>编辑</Button>
                    </Col>
                    <Col span={12}>
                        <Button type='link' danger onClick={() => {
                            // 删除字段
                            const fields: ObjectField[] = []
                            for (const item of objectTable.fields) {
                                if (item.id !== record.id) {
                                    fields.push(item)
                                }
                            }
                            updateTableFields(fields)
                        }}>删除</Button>
                    </Col>
                </Row>
            }
        }
    ]

    const warningDialog = (content: string) => {
        modalApi.warning({title: "代码生成", content: content, okText: "好的"})
    }

    // 更新表格中的字段
    const updateEditField = (record: ObjectField) => {
        const fieldArray: ObjectField[] = []
        for (const item of objectTable.fields) {
            if (item.id === record.id) {
                fieldArray.push(record)
            } else {
                fieldArray.push(item)
            }
        }
        updateTableFields(fieldArray)
    }

    // 检查是否有重复的字段名
    const checkSameNameFn = (fieldName: string, id: number): boolean => {
        return objectTable.fields.filter(item => item.fieldName === fieldName && item.id !== id).length > 0
    }

    /**
     * 创建新的字段
     */
    const createNewTable = () => {
        if (objectTable.fields.filter(item => item.fieldName === "<None>").length > 0) {
            warningDialog("字段表中有没有使用的字段，不能继续添加新的字段。请使用字段名为“<None>”的定义行。")
        } else {
            objectTable.fields.push(ObjectField.defaultEmpty(objectTable.fields.length))
            updateTableFields(objectTable.fields)
        }
    }

    // 更新表格使用的字段数组
    const updateTableFields = (fields: ObjectField[]) => {
        objectTable.fields = fields;

        const newObjectTable = ObjectTable.create();
        Object.assign(newObjectTable, JSON.parse(JSON.stringify(objectTable)))
        changeObjectTableFn(newObjectTable)
    }

    // 生成代码
    const generateCode = () => {
        let logText = generateLog;
        new CodeGenerate({
            onStart: (log: string) => {
                logText += log;
            }, onEnd: (log: string) => {
                logText += `${log}\n`;
                setGenerateLog(logText)
            }, onLogOut: (log: string) => {
                logText += log;
            }
        }).generate(project, objectTable, generateTypes).then()
    }

    // 删除表结构
    const deleteTable = () => {
        modalApi.confirm({
            title: "删除表结构",
            content: `确定要删除表结构“${objectTable.tableName}”吗？删除后不可恢复。删除表结构不会删除已生成的代码。`,
            okText: "删除",
            cancelText: "取消",
            onOk: () => {
                deleteTableFn(objectTable)
            }
        })
    }

    const [form] = Form.useForm()

    useEffect(() => {
        form.setFieldsValue({
            "tableName": objectTable.tableName,
            "tableCnName": objectTable.tableCnName,
            "tableComments": objectTable.tableComments,
        })
    }, [objectTable.tableName])

    return <div>
        {modalHolder}
        <div>
            <Row>
                <div style={{width: '400px', float: 'left'}}>
                    <Form labelCol={{span: 6}} initialValues={{}} form={form}>
                        <Form.Item label='数据结构名称'>
                            <Row>
                                <Col span={11}>
                                    <Form.Item labelCol={{span: 0}} name={'tableName'}>
                                        <Input placeholder={'表结构名称'} onChange={(e) => {
                                            objectTable.tableName = e.target.value
                                            changeObjectTableFn(objectTable)
                                        }}></Input>
                                    </Form.Item>
                                </Col>
                                <Col style={{marginLeft: '5px'}} span={11}>
                                    <Form.Item labelCol={{span: 0}} name={'tableCnName'}>
                                        <Input placeholder='中文名' onChange={(e) => {
                                            objectTable.tableCnName = e.target.value
                                            changeObjectTableFn(objectTable)
                                        }}></Input>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form.Item>
                        <Form.Item label="注释说明" wrapperCol={{span: 17}} name={'tableComments'}>
                            <TextArea rows={2} autoSize={{maxRows: 2, minRows: 2}} maxLength={255} onChange={(e) => {
                                objectTable.tableComments = e.target.value
                                changeObjectTableFn(objectTable)
                            }}/>
                        </Form.Item>
                    </Form>
                </div>
                <div style={{float: "left", width: 'calc(100% - 400px)'}}>
                    <Form>
                        <Form.Item label='运行日志'>
                            <TextArea autoSize={{maxRows: 6, minRows: 6}} value={generateLog} readOnly/>
                        </Form.Item>
                    </Form>
                </div>
            </Row>

            <Row style={{marginTop: '20px', marginBottom: '20px', width: '100%'}}>
                <Button icon={<AppstoreAddOutlined/>} type='primary' onClick={createNewTable}>添加一行</Button>
                <Button style={{marginLeft: '15px'}} icon={<CodeOutlined/>} type='primary'
                        onClick={generateCode}>生成代码</Button>
                <span style={{marginLeft: '30px', lineHeight: '30px'}}>生成选项：</span>
                <Select
                    mode="multiple"
                    defaultValue={generateTypes}
                    onChange={(types) => {
                        setGenerateTypes(types)
                    }}
                    style={{minWidth: '100px'}}
                    options={[
                        {value: CodeGenerateType.java, label: '代码'},
                        {value: CodeGenerateType.database, label: '数据库'},
                        {value: CodeGenerateType.document, label: '文档'}
                    ]}
                />
                <Button type='primary' style={{position: 'absolute', right: 20}} danger
                        onClick={deleteTable}>删除</Button>
            </Row>
            <Table rowKey={item => item.id} pagination={false} dataSource={objectTable.fields} columns={defineColumns}
                   bordered
                   scroll={{x: 'max-content'}}/>
            <EditObjectTableDialog changeObjectTableFn={updateEditField}
                                   showState={editDialogShow}
                                   changeModalShowFn={setEditDialogShow}
                                   checkSameNameFn={checkSameNameFn}></EditObjectTableDialog>
        </div>
    </div>
}

type HeaderSlot = {

    project: ProjectConfig

}

/**
 * Header部分
 */
function Header({project}: HeaderSlot) {

    const navigateFn = useNavigate();

    let databaseName = "<未知引擎>"
    if (project.databaseType === DatabaseType.MySQL) {
        databaseName = "MySQL"
    } else if (project.databaseType === DatabaseType.TiDB) {
        databaseName = "TiDB"
    }

    let engineName = "<未知引擎>"
    if (project.databaseOrm === DatabaseEngineType.MyBatisPlus) {
        engineName = "MyBatisPlus"
    } else if (project.databaseOrm === DatabaseEngineType.JPA) {
        engineName = "JPA"
    }

    return <div className='te-header'>
        <h3 className='te-header-title'>{project.projectName}</h3>
        <Tag className='te-header-tag' color="purple">Spring Boot</Tag>
        <Tag className='te-header-tag' color="geekblue">{databaseName}</Tag>
        <Tag className='te-header-tag' color="volcano">{engineName}</Tag>
        <Button type='link' className='te-header-back' onClick={() => {
            navigateFn(-1)
        }}>返回</Button>
    </div>
}

/**
 * 启动页面
 */
function EmptyTableView() {
    return <Row style={{width: '100%', height: '100%'}} justify='center' align='middle'>
        <span style={{fontSize: '40px', color: '#ababab'}}>点击左侧的表名快速开始表结构</span>
    </Row>
}

/**
 * 表格编辑
 */
export default function TableEditPage() {

    const [tableItems, setTableItems] = useState<MenuItemType[]>([])
    const [project, setProject] = useState<ProjectConfig>(new ProjectConfig())
    const [selectTable, setSelectTable] = useState<ObjectTable | null>(null)

    const updateTableMenu = (tables: ObjectTable[]) => {
        const menuItems: MenuItemType[] = []
        for (const table of tables) {
            menuItems.push({
                key: table.tableName,
                label: table.tableName,
            })
        }

        setTableItems(menuItems)
    }

    const initProject = async () => {
        const project = ProjectConfig.Current;
        if (project != null) {
            await project.loadTables()
            setProject(project)
            updateTableMenu(project.tables)
        }
    }

    useEffect(() => {
        initProject().then()
    }, [])


    const createTable = async () => {
        if (project == null) {
            return
        }
        const newTable = ObjectTable.create();
        newTable.tableName = `未命名_${tableItems.length + 1}`
        await project.saveTable(newTable)
        updateTableMenu(project.tables)
    }

    const onSelectTable = (key: string) => {
        for (const table of project.tables) {
            if (table.tableName === key) {
                setSelectTable(table)
                return
            }
        }
    }

    // 更新表结构
    const updateObjectTable = (table: ObjectTable) => {
        project.saveTable(table).then(() => {
            updateTableMenu(project.tables)
            setSelectTable(table)
        })
    }

    // 删除表结构
    const deleteObjectTable = async (table: ObjectTable) => {
        await project.deleteTable(table)
        setSelectTable(null)
        updateTableMenu(project.tables)
    }

    let contentElement = <div></div>
    if (selectTable == null) {
        contentElement = <EmptyTableView></EmptyTableView>
    } else {
        contentElement =
            <TableEditContent project={project} objectTable={selectTable}
                              changeObjectTableFn={updateObjectTable}
                              deleteTableFn={deleteObjectTable}></TableEditContent>
    }


    return <PageContainer>
        <Header project={project}></Header>
        <div className='te-content'>
            <Row className='ts-table-menu-header' align='middle'>
                <Space.Compact style={{width: '100%'}}>
                    <Input placeholder={'搜索表'}/>
                    <Button type="primary" onClick={createTable}>新建</Button>
                </Space.Compact>
            </Row>
            <Menu items={tableItems} className={'te-table-menu-body'} onClick={(e) => onSelectTable(e.key)}></Menu>
            <div className='te-table-content-body'>
                {contentElement}
            </div>
        </div>
    </PageContainer>
}