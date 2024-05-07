import {ObjectTable} from "../models/ObjectTable.ts";
import {CodeGenerate, ICodeGenerateAction} from "./CodeGenerate.ts";
import ProjectConfig, {DatabaseType} from "../models/Project.ts";
import Database from "tauri-plugin-sql-api";
import {ObjectFieldIndex} from "../models/ObjectField.ts";
import {fs} from "@tauri-apps/api";

/**
 * 数据库代码生成
 */
export class DatabaseGenerate implements ICodeGenerateAction {

    private readonly project: ProjectConfig;

    private readonly generate: CodeGenerate;

    constructor(generate: CodeGenerate, project: ProjectConfig) {
        this.project = project;
        this.generate = generate;
    }

    /**
     * 格式化数据库名称
     */
    formatDatabaseName(name: string): string {
        return this.generate.databaseNameFormat(name, this.project)
    }

    async onGenerate(table: ObjectTable): Promise<void> {
        let databaseUrl = ""
        const config = this.project
        if (this.project.databaseType === DatabaseType.MySQL) {
            databaseUrl = `mysql://${config.databaseUser}:${config.databasePassword}@${config.databaseHost}:${config.databasePort}/${config.databaseName}`
        } else {
            throw new Error("不支持的数据库驱动类型。databaseType is not MySQL.");
        }
        this.generate.logI(`连接数据库  '${databaseUrl}'`)
        try {
            const database = await Database.load(databaseUrl)

            const tableName = this.formatDatabaseName(table.tableName)
            // 检查表是否存在，如果表存在就更名为“表明_时间戳”
            const tableValidResult = await database.select<any[]>(`SHOW TABLES LIKE '${tableName}';`)
            if (tableValidResult.length > 0) {
                // 表已经存在，重命名表
                this.generate.logW(`数据库表 '${tableName}' 已存在，正在重命名`)
                const oldTableName = `${tableName}_${new Date().getTime()}`
                await database.execute(`RENAME TABLE ${tableName} TO ${oldTableName};`)
                this.generate.logI(`旧的表已重命名为 '${oldTableName}' `)
            }

            // SQL文件内容
            let sqlFileContent = ""

            // 表字段表达式
            let tableColumnsSql = ''
            // 主键表达式
            let primaryKeySql = 'PRIMARY KEY ('
            // 索引表达式
            let indexSqlList: string[] = []
            for (const field of table.fields) {
                tableColumnsSql += `'${this.formatDatabaseName(field.fieldName)}' 
                                ${this.generate.sqlType(field.fieldType)}${this.generate.sqlTypeLength(field)} 
                                ${field.autoGrowth ? 'AUTO_INCREMENT' : ''} 
                                ${field.allowNull ? '' : 'NOT NULL'} 
                                COMMENT "${field.fieldCnName}${field.comments.length > 0 ? ',' : ''}${field.comments}" ,`;
                if (field.primaryKey) {
                    primaryKeySql += `'${this.formatDatabaseName(field.fieldName)}',`;
                }
                if (field.indexType === ObjectFieldIndex.Index) {
                    indexSqlList.push(`ALTER TABLE '${tableName}' ADD INDEX ${tableName.toLowerCase()}_index_${this.formatDatabaseName(field.fieldName).toLowerCase()}_${new Date().getTime()}('${this.formatDatabaseName(field.fieldName)}');`);
                } else if (field.indexType === ObjectFieldIndex.Unique) {
                    indexSqlList.push(`ALTER TABLE '${tableName}' ADD UNIQUE ${tableName.toLowerCase()}_unique_${this.formatDatabaseName(field.fieldName).toLowerCase()}_${new Date().getTime()}('${this.formatDatabaseName(field.fieldName)}');`);
                }
            }
            primaryKeySql = primaryKeySql.substring(0, primaryKeySql.length - 1);
            primaryKeySql += ")";
            primaryKeySql = primaryKeySql.replaceAll("'", "`")

            tableColumnsSql = tableColumnsSql.replaceAll("\n", "").replaceAll(/ {2,}/g, " ");
            tableColumnsSql = tableColumnsSql.substring(0, tableColumnsSql.length - 1);
            tableColumnsSql = tableColumnsSql.replaceAll("'", "`").replaceAll("\"", "'")

            const sqlTableName = "`" + tableName + "`";

            const createTableSql = `CREATE TABLE ${sqlTableName} (${tableColumnsSql} , ${primaryKeySql}) ENGINE=InnoDB DEFAULT CHARSET=utf8;`;
            // 创建表结构
            await database.execute(createTableSql)
            sqlFileContent += `${createTableSql}\n`;

            // 创建索引
            for (const indexSql of indexSqlList) {
                const createIndexSql = indexSql.replaceAll("'", "`")
                sqlFileContent += `${createIndexSql}\n`;
                await database.execute(createIndexSql)
            }

            this.generate.logI(`表结构 '${tableName}' 创建成功`)

            await database.close()

            // 创建SQL文件
            await fs.writeFile(this.generate.makePath([this.project.sqlPath, `${table.tableName}.sql`]), sqlFileContent)
            this.generate.logI(`'${table.tableName}.sql' 文件写入成功`)
        } catch (error: any) {
            throw new Error("创建表结构时发生错误，" + error);
        }
    }
}