/**
 * Markdown文档模板
 */
export const MarkdownDocumentTemplate:string=`
# #CLASS_NAME# - #TABLE_CN_NAME#

创建日期：#CREATE_DATE#

数据结构名称：#CLASS_NAME#

中文名称：#TABLE_CN_NAME#

数据结构说明：#TABLE_COMMENTS#

表结构名称：#DATABASE_TABLE_NAME#

Java 控制器名称：#CLASS_NAME#ControllerTemplate

Java 服务名称：#CLASS_NAME#ServiceTemplate

Java Entity名称：#CLASS_NAME#

Java Mapper名称：#CLASS_NAME#Mapper



**简易表结构**

| 字段 | 数据类型 | 可空 | 索引 | 取值范围 | 字段说明 |
| ---- | -------- | ---- | ---- | -------- | -------- |
#TABLE_SIMPLE_FIELD_STRCUTOR#



**完整表结构**

| 字段 | 中文说明 | 数据类型 | 索引 | 可空 | 长度限制 | 值区间 | 查询规则 | 保存规则 | 字段说明 |
| ---- | -------- | -------- | ---- | ---- | -------- | ------ | ------------ | ------------ | -------- |
#TABLE_FIELD_STRCUTOR#

`
