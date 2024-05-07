import {fs, path} from "@tauri-apps/api";
import {ObjectTable} from "./ObjectTable.ts";

/**
 * 数据库类型
 */
export class DatabaseType {

    static MySQL = 0

    static TiDB = 1

}

/**
 * 数据库字段格式化类型
 */
export class DatabaseFormatType {

    /**
     * 默认
     */
    static Default = 0

    /**
     * 全大写
     */
    static AllCaps = 1

    /**
     * 全小写
     */
    static AllLowercase = 2

}

/**
 * 数据库驱动类型
 */
export class DatabaseEngineType {

    static MyBatisPlus = 0

    static JPA = 1

}


/**
 * 项目配置
 */
export default class ProjectConfig {

    /**
     * 当前正在使用的项目配置
     */
    static Current?: ProjectConfig | null = null;

    static readonly VersionCode = 1

    static readonly VersionName = "1.0.0"

    /**
     * 项目名称
     */
    projectName: string = "";

    /**
     * 包名
     */
    packageName: string = "";

    /**
     * 项目描述
     */
    description: string = "";

    /**
     * 项目路径
     */
    projectPath: string = "";

    /**
     * 数据库类型，0：MySQL，1：TiDB
     */
    databaseType: number = 0;

    /**
     * 数据库Orm，0：MyBatis-Plus，1：JPA
     */
    databaseOrm: number = 0;

    /**
     * 数据库名称
     */
    databaseName: string = "";

    /**
     * 数据库Host
     */
    databaseHost: string = "127.0.0.1";

    /**
     * 数据库端口号
     */
    databasePort: number = 3306;

    /**
     * 数据库用户名
     */
    databaseUser: string = "";

    /**
     * 数据库密码
     */
    databasePassword: string = "";

    /**
     * 数据库字段类型，0：默认，1：全大写，2：全小写
     */
    databaseFieldType: number = 1;

    /**
     * 数据库字段前缀
     */
    databaseFieldPrefix: string = "";

    /**
     * 生成时备份
     */
    generateBackup: boolean = true;

    /**
     * 分页字段名称
     */
    pageFieldName: string = "page";

    /**
     * 分页页码字段名称
     */
    pageSizeFieldName: string = "dataSize";

    /**
     * 表结构
     */
    tables: ObjectTable[] = []

    private _versionCode = ProjectConfig.VersionCode
    private _versionName = ProjectConfig.VersionName
    private _springBootProjectPath: string = ""
    private _workPath: string = ""
    private _srcPath: string = ""
    private _documentPath: string = ""
    private _sqlPath: string = ""
    // 项目配置文件名
    private readonly _configFileName: string = ProjectConfig.ProjectFileSuffix
    // 表结构的后缀
    private readonly _tableFileSuffix: string = ".table.sp.json";

    static ProjectFileSuffix: string = "project.sg.json";

    /**
     * 自我检查每一项值是否符合规则
     */
    private selfExamination() {
        if (this.projectName.length === 0) {
            throw new Error(`项目名称格式不正确，请在'项目设置'处设置。`);
        }
        if (this.packageName.length === 0) {
            throw new Error(`项目包名格式不正确，请在'项目设置'处设置。`);
        }
        if (this.projectPath.length === 0) {
            throw new Error(`项目路径格式不正确，请在'项目设置'处设置。`);
        }
        if (this.databaseName.length === 0) {
            throw new Error(`数据库名格式不正确，请在'数据库'处设置。`);
        }
        if (this.databaseHost.length === 0) {
            throw new Error(`数据库Host格式不正确，请在'数据库'处设置。`);
        }
        if (this.databasePort === null) {
            throw new Error(`数据库端口号格式不正确，请在'数据库'处设置。`);
        }
        if (this.databaseUser === null) {
            throw new Error(`数据库用户名格式不正确，请在'数据库'处设置。`);
        }
        if (this.databasePassword === null) {
            throw new Error(`数据库密码格式不正确，请在'数据库'处设置。`);
        }
        if (this.pageFieldName.length === 0) {
            throw new Error(`分页页码字段名称格式不正确，请在'代码生成'处设置。`);
        }
        if (this.pageSizeFieldName.length === 0) {
            throw new Error(`分页长度   字段名称格式不正确，请在'代码生成'处设置。`);
        }
    }

    /**
     * 初始化项目
     */
    async initialize(): Promise<void> {
        this.selfExamination()
        this._springBootProjectPath = this.projectPath
        this._workPath = this.projectPath + path.sep + 'src' + path.sep + "expands" + path.sep + "SpringGenerate"
        this._srcPath = this._workPath + path.sep + 'src'
        this._documentPath = this._workPath + path.sep + 'document'
        this._sqlPath = this._workPath + path.sep + 'sql'


        if (!(await fs.exists(this._springBootProjectPath))) {
            throw new Error(`项目路径'${this._springBootProjectPath}'不存在。`)
        }

        if (!(await fs.exists(this._workPath))) {
            await fs.createDir(this._workPath, {recursive: true})
        }

        if (!(await fs.exists(this._srcPath))) {
            await fs.createDir(this._srcPath)
        }

        if (!(await fs.exists(this._documentPath))) {
            await fs.createDir(this._documentPath)
        }

        if (!(await fs.exists(this._sqlPath))) {
            await fs.createDir(this._sqlPath)
        }

        const configFilePath = `${this._workPath}${path.sep}${this._configFileName}`
        if (await fs.exists(configFilePath)) {
            throw new Error("项目已经存在，不能重复创建。")
        }

        // 写入项目文件
        await fs.writeFile(configFilePath, JSON.stringify(this))
    }


    get sqlPath(): string {
        return this._sqlPath;
    }

    get documentPath(): string {
        return this._documentPath;
    }

    get srcPath(): string {
        return this._srcPath;
    }

    get workPath(): string {
        return this._workPath;
    }

    get springBootProjectPath(): string {
        return this._springBootProjectPath;
    }

    get versionName(): string {
        return this._versionName;
    }

    get versionCode(): number {
        return this._versionCode;
    }

    /**
     * 从路径中获取项目配置
     */
    static async loadWithPath(path: string): Promise<ProjectConfig> {
        if (ProjectConfig.Current == null) {
            ProjectConfig.Current = new ProjectConfig();
        }
        Object.assign(ProjectConfig.Current, JSON.parse(await fs.readTextFile(path)));
        return ProjectConfig.Current;
    }

    /**
     * 读取表结构
     */
    async loadTables(): Promise<void> {
        const tables: ObjectTable[] = []
        const files = await fs.readDir(this._srcPath)
        for (const file of files) {
            if (file.name?.endsWith(this._tableFileSuffix)) {
                const jsonText = await fs.readTextFile(file.path)
                try {
                    const objectTable = ObjectTable.create()
                    Object.assign(objectTable, JSON.parse(jsonText))
                    tables.push(objectTable)
                } catch (e) {
                }
            }
        }

        this.tables = tables
    }

    /**
     * 删除表结构
     */
    async deleteTable(table: ObjectTable): Promise<void> {
        const tableFilePath = `${this._srcPath}/${table.tableId}${this._tableFileSuffix}`
        await fs.removeFile(tableFilePath)

        const tableArray: ObjectTable[] = []
        for (const item of this.tables) {
            if (item.tableId !== table.tableId) {
                tableArray.push(item)
            }
        }
        this.tables = tableArray
    }

    /**
     * 保存一个表结构到项目中
     */
    async saveTable(table: ObjectTable): Promise<void> {
        await fs.writeTextFile(`${this._srcPath}/${table.tableId}${this._tableFileSuffix}`, JSON.stringify(table))

        if (this.tables.filter(item => item.tableId === table.tableId).length > 0) {
            const tableArray: ObjectTable[] = []
            for (const item of this.tables) {
                if (item.tableId === table.tableId) {
                    tableArray.push(table)
                } else {
                    tableArray.push(item)
                }
            }
            this.tables = tableArray
        } else {
            this.tables.push(table)
        }
    }

    /**
     * 生成相关业务代码
     */
    async generate(table: ObjectTable) {
        // 检查这个表的名字是否发生重复
        const repeatSize = this.tables.filter(item => item.tableId !== table.tableId && item.tableName === table.tableName).length
        if (repeatSize > 0) {
            throw new Error(`表结构名"${table.tableName}"已被使用，无法生成。`)
        }

        // 开始生成
    }

}

