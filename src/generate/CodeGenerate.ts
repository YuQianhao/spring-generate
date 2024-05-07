import ProjectConfig, {DatabaseFormatType} from "../models/Project.ts";
import {ObjectTable} from "../models/ObjectTable.ts";
import {path} from "@tauri-apps/api";
import {JavaCodeGenerate} from "./JavaCodeGenerate.ts";
import {ObjectField, ObjectFieldType} from "../models/ObjectField.ts";
import {DatabaseGenerate} from "./DatabaseGenerate.ts";
import {DocumentGenerate} from "./DocumentGenerate.ts";
import {nowDate} from "../libs/date.ts";

export type CodeGenerateAdapter = {

    onLogOut: (log: string) => void;

    onStart: (log: string) => void;

    onEnd: (log: string) => void;

}

/**
 * 代码生成
 */
export class CodeGenerate {

    readonly adapter: CodeGenerateAdapter;

    constructor(adapter: CodeGenerateAdapter) {
        this.adapter = adapter;
    }

    /**
     * 生成代码
     * @param project           项目
     * @param table             表结构
     * @param generateTypes      生成类型数组
     */
    async generate(project: ProjectConfig, table: ObjectTable, generateTypes: CodeGenerateType[]): Promise<void> {
        this.adapter.onStart(this.createLog("info", `开始为"${table.tableName}"生成代码`));
        try {
            for (let generateType of generateTypes) {
                if (CodeGenerateType.java === generateType) {
                    await new JavaCodeGenerate(this, project).onGenerate(table);
                }
                if (CodeGenerateType.database === generateType) {
                    await new DatabaseGenerate(this, project).onGenerate(table);
                }
                if (CodeGenerateType.document === generateType) {
                    await new DocumentGenerate(this, project).onGenerate(table);
                }
            }
        } catch (error: any) {
            this.logE(error)
        }
        this.adapter.onEnd(this.createLog("info", "生成结束"));
    }


    /**
     * 将名称转换为数据库的名称
     */
    databaseNameFormat(name: string, project: ProjectConfig): string {
        let databaseFieldName = project.databaseFieldPrefix;
        if (project.databaseFieldType === DatabaseFormatType.Default) {
            databaseFieldName += name;
        } else if (project.databaseFieldType === DatabaseFormatType.AllCaps) {
            databaseFieldName += name.toUpperCase();
        } else if (project.databaseFieldType === DatabaseFormatType.AllLowercase) {
            databaseFieldName += name.toLowerCase();
        }
        return databaseFieldName;
    }

    /**
     * 首字母大写
     */
    firstCaseUpper(name: string): string {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    /**
     * 获取SQL类型的字段长度
     */
    sqlTypeLength(field: ObjectField): string {
        if (ObjectField.typeIsText(field.fieldType)) {
            return `(${field.fieldLength})`
        } else if (field.fieldType === ObjectFieldType.Boolean) {
            return "(1)";
        }
        return "";
    }

    /**
     * 获取SQL的类型
     */
    sqlType(type: number): string {
        if (ObjectFieldType.Integer === type) {
            return "INTEGER";
        } else if (ObjectFieldType.Double === type) {
            return "DOUBLE"
        } else if (ObjectFieldType.Char === type) {
            return "CHAR"
        } else if (ObjectFieldType.Varchar === type) {
            return "VARCHAR"
        } else if (ObjectFieldType.Boolean === type) {
            return "TINYINT"
        } else if (ObjectFieldType.DateTime === type) {
            return "DATETIME"
        }
        return "<未知类型>";
    }

    /**
     * 获取java类型
     */
    javaType(type: number): string {
        if (ObjectFieldType.Integer === type) {
            return "Integer";
        } else if (ObjectFieldType.Double === type) {
            return "Double"
        } else if (ObjectFieldType.Char === type) {
            return "String"
        } else if (ObjectFieldType.Varchar === type) {
            return "String"
        } else if (ObjectFieldType.Boolean === type) {
            return "Boolean"
        } else if (ObjectFieldType.DateTime === type) {
            return "Date"
        }
        return "<未知类型>";
    }

    private createLog(level: string, log: string): string {
        return `${nowDate().toUTCString()}\t[${level}]\t${log}\n`
    }

    private log(level: string, log: string): void {
        this.adapter.onLogOut(this.createLog(level, log));
    }

    /**
     * 将多个文件名合成一个路径
     */
    makePath(fileNames: string[]): string {
        let resultPath = ""
        for (const fileName of fileNames) {
            if (resultPath.length > 0) {
                resultPath += path.sep;
            }
            resultPath += fileName;
        }
        return resultPath;
    }

    /**
     * 将包名转换为路径
     */
    packagePath(project: ProjectConfig): string {
        return project.packageName.replaceAll(".", path.sep)
    }

    logI(text: string): void {
        this.log("info", text)
    }

    logE(text: string): void {
        this.log("error", text)
    }

    logW(text: string): void {
        this.log("warn", text)
    }

}

export interface ICodeGenerateAction {

    onGenerate: (table: ObjectTable) => Promise<void>;

}

/**
 * 代码生成器类型
 */
export class CodeGenerateType {

    /**
     * Java代码
     */
    static java = "java";

    /**
     * 数据库代码
     */
    static database = "database";

    /**
     * 文档
     */
    static document = "document"

}