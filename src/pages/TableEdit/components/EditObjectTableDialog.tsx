import {Button, Card, Form, Input, InputNumber, Modal, Radio, Row, Select} from "antd";
import {IModalSlot} from "../../../libs/modal.ts";
import {ObjectField} from "../../../models/ObjectField.ts";
import TextArea from "antd/lib/input/TextArea";
import {useEffect, useState} from "react";
import {ObjectFieldEditCache} from "../index.tsx";


type EditObjectTableSlot = {
    // 更改表结构字段对象的函数
    changeObjectTableFn: (record: ObjectField) => void;

    // 检查是否有重复的字段名
    checkSameNameFn: (fieldName: string, id: number) => boolean;


} & IModalSlot

export default function EditObjectTableDialog({
                                                  changeObjectTableFn,
                                                  showState,
                                                  changeModalShowFn,
                                                  checkSameNameFn
                                              }: EditObjectTableSlot) {

    // 深度拷贝一个对象，防止在没有提交之前干扰到表格的内容
    const [objectField, setObjectField] = useState<ObjectField>(new ObjectField())
    const [allowEditFieldLength, setAllowEditFieldLength] = useState<boolean>(ObjectField.typeIsText(objectField.fieldType));
    const [allowEditFieldValueRange, setAllowEditFieldValueRange] = useState<boolean>(ObjectField.typeIsNumber(objectField.fieldType))

    const [modalApi, modalHolder] = Modal.useModal()

    const [form] = Form.useForm()

    const fieldTypes = [
        {
            value: 0,
            label: "Integer"
        },
        {
            value: 1,
            label: "Double"
        },
        {
            value: 2,
            label: "Char"
        },
        {
            value: 3,
            label: "Varchar"
        },
        {
            value: 4,
            label: "Boolean"
        },
        {
            value: 5,
            label: "DateTime"
        }
    ]

    const selectIndexType = [
        {
            value: 0,
            label: "不启用"
        },
        {
            value: 1,
            label: "Index"
        },
        {
            value: 2,
            label: "Unique"
        }
    ]

    const selectMethodType = [
        {
            value: 0,
            label: "不启用"
        },
        {
            value: 1,
            label: "Equal"
        },
        {
            value: 2,
            label: "Like"
        },
        {
            value: 3,
            label: "Range"
        }
    ]

    const saveMethodType = [
        {
            value: 0,
            label: "不启用"
        },
        {
            value: 1,
            label: "公共Save接口"
        },
        {
            value: 2,
            label: "独立Save接口"
        },
        {
            value: 3,
            label: "加入和独立Save接口"
        }
    ]

    // 保存当前更改
    const saveChange = () => {
        if (objectField.fieldName.length === 0) {
            modalApi.error({title: "表结构编辑", content: "字段名称格式不正确。", okText: "好的"})
            return
        }
        if (checkSameNameFn(objectField.fieldName, objectField.id)) {
            modalApi.error({
                title: "表结构编辑",
                content: `字段名称“${objectField.fieldName}”已被使用。`,
                okText: "好的"
            })
            return
        }
        // 检查字段名称是否符合规则
        if (!(/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(objectField.fieldName))) {
            modalApi.error({
                title: "表结构编辑",
                content: "字段名称格式不正确，仅支持“a-z”，“A-Z”，“_”和“0-9”，字段开头必须是“a-z”，“A-Z”或“_”。",
                okText: "好的"
            })
            return;
        }
        changeObjectTableFn(objectField)
        changeModalShowFn(false)
    }

    // 更改类型数值区间
    const changeTypeLimitFn = (typeCode: number) => {
        // 默认开启全部的类型附属规则编辑
        setAllowEditFieldLength(true)
        setAllowEditFieldValueRange(true)
        if (!ObjectField.typeIsText(typeCode)) {
            // 非文本模式下，关闭长度附属设置
            setAllowEditFieldLength(false)
            form.setFieldsValue({
                "minLength": 0,
                "maxLength": 0,
                "fieldLength": 0
            })
            objectField.minLength = 0
            objectField.maxLength = 0
            objectField.fieldLength = 0
        }
        if (!ObjectField.typeIsNumber(typeCode)) {
            // 非数字模式下关闭数字附属规则设置
            setAllowEditFieldValueRange(false)
            form.setFieldsValue({
                "minValue": 0,
                "maxValue": 0
            })
            objectField.maxValue = 0
            objectField.minValue = 0
        }
    }

    useEffect(() => {
        if (showState) {
            const currentEditObjectField = ObjectFieldEditCache.CurrentEditObjectField
            setObjectField(currentEditObjectField)
            form.setFieldsValue({
                "fieldName": currentEditObjectField.fieldName,
                "fieldCnName": currentEditObjectField.fieldCnName,
                "fieldType": currentEditObjectField.fieldType,
                "fieldLength": currentEditObjectField.fieldLength,
                "indexType": currentEditObjectField.indexType,
                "allowNull": currentEditObjectField.allowNull,
                "minLength": currentEditObjectField.minLength,
                "maxLength": currentEditObjectField.maxLength,
                "minValue": currentEditObjectField.minValue,
                "maxValue": currentEditObjectField.maxValue,
                "selectType": currentEditObjectField.selectType,
                "saveParamsType": currentEditObjectField.saveParamsType,
                "comments": currentEditObjectField.comments,
            })
            changeTypeLimitFn(currentEditObjectField.fieldType)
        }
    }, [showState])

    return <Modal title={'编辑字段'} okText='完成' cancelText='关闭'
                  footer={() => {
                      return <Row justify='end'>
                          <Button onClick={() => changeModalShowFn(false)}>关闭</Button>
                          <Button style={{marginLeft: "10px"}} type='primary' onClick={saveChange}>保存</Button>
                          {/*<Button style={{marginLeft: "10px"}} type='primary' color='red'>保存并添加一行</Button>*/}
                      </Row>
                  }}
                  afterClose={() => {
                      form.resetFields()
                  }}
                  open={showState} width={500}
                  onCancel={() => {
                      changeModalShowFn(false)
                  }}>
        {modalHolder}
        <Card style={{border: "none"}}>
            <Form initialValues={{}} form={form} wrapperCol={{span: 12}} labelCol={{span: 6}}>
                <Form.Item label='字段名称' name='fieldName'>
                    <Input onChange={(e) => {
                        objectField.fieldName = e.target.value
                        setObjectField(objectField)
                    }}/>
                </Form.Item>
                <Form.Item label='中文名称' name='fieldCnName'>
                    <Input onChange={(e) => {
                        objectField.fieldCnName = e.target.value
                        setObjectField(objectField)
                    }}/>
                </Form.Item>
                <Form.Item label='数据类型' name='fieldType'>
                    <Select options={fieldTypes} onChange={(type) => {
                        objectField.fieldType = type
                        changeTypeLimitFn(type)
                        setObjectField(objectField)
                    }}></Select>
                </Form.Item>
                <Form.Item label='字段长度' name='fieldLength'>
                    <InputNumber disabled={!allowEditFieldLength} min={0} onChange={(value) => {
                        if (value != null) {
                            objectField.fieldLength = value
                            objectField.minLength = 1
                            objectField.maxLength = value
                        } else {
                            objectField.minLength = 0
                            objectField.minLength = 0
                            objectField.fieldLength = 0
                        }
                        form.setFieldValue("minLength", 1)
                        form.setFieldValue("maxLength", objectField.fieldLength)
                        setObjectField(objectField)
                    }}></InputNumber>
                </Form.Item>
                <Form.Item label='索引类型' name='indexType'>
                    <Select options={selectIndexType} onChange={(type) => {
                        objectField.indexType = type
                        setObjectField(objectField)
                    }}></Select>
                </Form.Item>
                <Form.Item label='允许空值' name='allowNull'>
                    <Radio.Group buttonStyle="solid" defaultValue={true} onChange={(e) => {
                        objectField.allowNull = e.target.value
                        setObjectField(objectField)
                    }}>
                        <Radio.Button value={true}>允许</Radio.Button>
                        <Radio.Button value={false}>不允许</Radio.Button>
                    </Radio.Group>
                </Form.Item>
                <Form.Item label='长度限制' style={{marginBottom: 0}}>
                    <Row>
                        <Form.Item name='minLength'>
                            <InputNumber disabled={!allowEditFieldLength} min={0} onChange={(value) => {
                                if (value != null) {
                                    objectField.minLength = value
                                } else {
                                    objectField.minLength = 0
                                }
                                setObjectField(objectField)
                            }}></InputNumber>
                        </Form.Item>
                        <Form.Item style={{marginLeft: "15px"}} name='maxLength'>
                            <InputNumber disabled={!allowEditFieldLength} min={0} onChange={(value) => {
                                if (value != null) {
                                    objectField.maxLength = value
                                } else {
                                    objectField.maxLength = 0
                                }
                                setObjectField(objectField)
                            }}></InputNumber>
                        </Form.Item>
                    </Row>
                </Form.Item>
                <Form.Item label='有效值限制' style={{marginBottom: 0}}>
                    <Row>
                        <Form.Item name='minValue'>
                            <InputNumber disabled={!allowEditFieldValueRange} min={0} onChange={(value) => {
                                if (value != null) {
                                    objectField.minValue = value
                                } else {
                                    objectField.minValue = 0
                                }
                                setObjectField(objectField)
                            }}></InputNumber>
                        </Form.Item>
                        <Form.Item style={{marginLeft: "15px"}} name='maxValue'>
                            <InputNumber disabled={!allowEditFieldValueRange} min={0} onChange={(value) => {
                                if (value != null) {
                                    objectField.maxValue = value
                                } else {
                                    objectField.maxValue = 0
                                }
                                setObjectField(objectField)
                            }}></InputNumber>
                        </Form.Item>
                    </Row>
                </Form.Item>
                <Form.Item label='查询接口规则' name='selectType'>
                    <Select options={selectMethodType} onChange={(type) => {
                        objectField.selectType = type
                        setObjectField(objectField)
                    }}></Select>
                </Form.Item>
                <Form.Item label='保存接口规则' name='saveParamsType'>
                    <Select options={saveMethodType} onChange={(type) => {
                        objectField.saveParamsType = type
                        setObjectField(objectField)
                    }}></Select>
                </Form.Item>
                <Form.Item label='注释说明' name='comments'>
                    <TextArea autoSize={{minRows: 2, maxRows: 2}} rows={2} maxLength={255} onChange={(e) => {
                        objectField.comments = e.target.value
                        setObjectField(objectField)
                    }}></TextArea>
                </Form.Item>
            </Form>
        </Card>
    </Modal>
}