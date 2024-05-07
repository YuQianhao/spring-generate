import {
    ObjectField,
    ObjectFieldIndex,
    ObjectFieldSaveMode,
    ObjectFieldSelectMode,
    ObjectFieldType
} from "./ObjectField.ts";
import {Md5} from "ts-md5";

/**
 * 表结构
 */
export class ObjectTable {

    /**
     * 表结构ID，唯一，不会重复
     */
    readonly tableId: string;

    /**
     * 表名
     */
    tableName: string = "";

    /**
     * 表中文名
     */
    tableCnName: string = "";

    /**
     * 表注释
     */
    tableComments: string = "";

    fields: ObjectField[] = []

    private constructor() {
        this.tableId = Md5.hashStr(new Date().getTime().toString()).toUpperCase()
    }

    /**
     * 创建一个新的表
     */
    static create() {
        const table = new ObjectTable()
        const idKeyField = new ObjectField()
        idKeyField.id = 0;
        idKeyField.fieldName = 'id'
        idKeyField.fieldType = ObjectFieldType.Integer;
        idKeyField.primaryKey = true;
        idKeyField.autoGrowth = true;
        idKeyField.unsigned = true;
        idKeyField.fieldCnName = '主键ID'
        idKeyField.selectType = ObjectFieldSelectMode.Equal;
        idKeyField.saveParamsType = ObjectFieldSaveMode.AllAndSingleSave;
        idKeyField.indexType = ObjectFieldIndex.Unique
        idKeyField.allowNull = false;
        idKeyField.comments = "主键ID，自增，无符号整数。";
        table.fields.push(idKeyField);
        return table
    }

}