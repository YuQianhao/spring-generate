import {CodeGenerate, ICodeGenerateAction} from "./CodeGenerate.ts";
import {ObjectTable} from "../models/ObjectTable.ts";
import ProjectConfig from "../models/Project.ts";
import {MarkdownDocumentTemplate} from "../template/markdownDocument.ts";
import {fs} from "@tauri-apps/api";
import {ObjectField, ObjectFieldIndex, ObjectFieldSaveMode, ObjectFieldSelectMode} from "../models/ObjectField.ts";
import {nowDate} from "../libs/date.ts";

export class DocumentGenerate implements ICodeGenerateAction {

    private readonly generate: CodeGenerate;
    private readonly project: ProjectConfig;


    constructor(generate: CodeGenerate, project: ProjectConfig) {
        this.generate = generate;
        this.project = project;
    }

    async onGenerate(table: ObjectTable): Promise<void> {
        let documentContent = MarkdownDocumentTemplate.replaceAll("#CLASS_NAME#", table.tableName);
        documentContent = documentContent.replaceAll("#CREATE_DATE#", nowDate().toUTCString());
        documentContent = documentContent.replaceAll("#TABLE_CN_NAME#", table.tableCnName);
        documentContent = documentContent.replaceAll("#TABLE_COMMENTS#", table.tableComments);
        documentContent = documentContent.replaceAll("#DATABASE_TABLE_NAME#", this.generate.databaseNameFormat(table.tableName, this.project));

        // 简易字段文档
        let simpleFieldsDocument = ""
        // 完整字段文档
        let fieldsDocument = ""
        for (const field of table.fields) {
            // 数据类型
            const typeName = `${this.generate.sqlType(field.fieldType)}${this.generate.sqlTypeLength(field)}`
            // 索引名称
            let indexName = ""
            if (field.indexType !== ObjectFieldIndex.None) {
                indexName = field.indexType === ObjectFieldIndex.Index ? "Index" : "Unique"
            }
            // 取值范围
            let rangeText = "-"
            if (ObjectField.typeIsText(field.fieldType)) {
                rangeText = `长度限制：${field.minLength} - ${field.maxLength}`;
            } else if (ObjectField.typeIsNumber(field.fieldType)) {
                rangeText = `取值范围：${field.minValue} - ${field.maxValue}`;
            }
            // 字段说明
            let commentsText = field.fieldCnName;
            if (field.comments.length > 0) {
                commentsText += `。${field.comments}`
            }
            // 是否可空
            const allowNullText = `${field.allowNull ? '是' : '否'}`

            // 文本长度区间
            let textLengthRange = "-"
            if (ObjectField.typeIsText(field.fieldType)) {
                textLengthRange = `${field.minLength} - ${field.maxLength}`;
            }
            // 取值范围区间
            let valueRange = "-"
            if (ObjectField.typeIsNumber(field.fieldType)) {
                valueRange = `${field.minValue} - ${field.maxValue}`;
            }

            // 查询模式文本
            let selectModeText = "-"
            if (field.selectType === ObjectFieldSelectMode.Like) {
                selectModeText = "模糊匹配"
            } else if (field.selectType === ObjectFieldSelectMode.Equal) {
                selectModeText = "精确匹配"
            } else if (field.selectType === ObjectFieldSelectMode.Range) {
                selectModeText = "范围区间"
            }

            // 保存接口模式文本
            let saveModeText = "-"
            if (field.saveParamsType === ObjectFieldSaveMode.OnlyAllSave) {
                saveModeText = "仅公共Save接口"
            } else if (field.saveParamsType === ObjectFieldSaveMode.OnlySingleSave) {
                saveModeText = "仅独立Save接口"
            } else if (field.saveParamsType === ObjectFieldSaveMode.AllAndSingleSave) {
                saveModeText = "全部Save接口"
            }

            simpleFieldsDocument += `|${field.fieldName}|${typeName}|${allowNullText}|${indexName}|${rangeText}|${commentsText}|\n`;
            fieldsDocument += `|${field.fieldName}|${field.fieldCnName}|${typeName}|${indexName}|${allowNullText}|${textLengthRange}|${valueRange}|${selectModeText}|${saveModeText}|${table.tableComments}|\n`;
        }

        documentContent = documentContent.replaceAll("#TABLE_SIMPLE_FIELD_STRCUTOR#", simpleFieldsDocument)
        documentContent = documentContent.replaceAll("#TABLE_FIELD_STRCUTOR#", fieldsDocument)

        await fs.writeTextFile(this.generate.makePath([this.project.documentPath, `${table.tableName}.md`]), documentContent)
        this.generate.logI(`文档 '${table.tableName}.md' 生成成功`)
    }


}