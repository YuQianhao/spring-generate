export class ObjectField {

    /**
     * 字段ID
     */
    id: number = 0;

    /**
     * 是否是主键
     */
    primaryKey: boolean = false;

    /**
     * 是否自增
     */
    autoGrowth: boolean = false;

    /**
     * 是否是无符号数值类型，仅对“Integer”和“Double”生效
     */
    unsigned: boolean = false;

    /**
     * 字段名称
     */
    fieldName: string = "<None>";

    /**
     * 字段中文名
     */
    fieldCnName: string = "";

    /**
     * 字段类型
     * 0：Integer
     * 1：Double
     * 2：Char
     * 3：Varchar
     * 4、Boolean
     * 5：DateTime
     */
    fieldType: number = 0;

    /**
     * 字段长度，仅对`Char`和`Varchar`生效
     */
    fieldLength: number = 0;

    /**
     * 索引类型
     * 0：不启用
     * 1：Index索引
     * 2：唯一索引
     */
    indexType: number = 0;

    /**
     * 是否允许空
     */
    allowNull: boolean = false;

    /**
     * 字段最小长度，仅对`Char`和`Varchar`生效，该字段会在`save`接口中检查参数的合法性
     */
    minLength: number = 0;

    /**
     * 字段最大长度，仅对`Char`和`Varchar`生效，该字段会在`save`接口中检查参数的合法性
     */
    maxLength: number = 0;

    /**
     * 字段最小值，仅对`Integer`和`Double`生效，该字段会在`save`接口中检查参数的合法性
     */
    minValue: number = 0;

    /**
     * 字段最大值，仅对`Integer`和`Double`生效，该字段会在`save`接口中检查参数的合法性
     */
    maxValue: number = 0;

    /**
     * 查询接口规则。
     * 0：不启用
     * 1：Equal完全相等匹配
     * 2：Like模糊搜索匹配
     * 3：Range范围查询匹配，在这个模式中，会将这个字段拆分为两个字段，例如`age`，Range匹配模式下会拆分成`ageStart`和`ageEnd`使用，生成范围查询sql
     */
    selectType: number = 0;

    /**
     * 保存接口规则。
     * 0：不启用，
     * 1：添加到保存接口中，并按照`字段类型`，`字段长度限制`和`字段长度限制`检查
     * 2：不添加到保存接口中，单独生成单字段更新的接口，并按照`字段类型`，`字段长度限制`和`字段长度限制`检查
     * 3：添加到保存接口中，也单独生成单字段更新的接口，并按照`字段类型`，`字段长度限制`和`字段长度限制`检查
     */
    saveParamsType: number = 0;

    /**
     * 字段注释
     */
    comments: string = "";


    /**
     * 创建一个空的字段
     */
    static defaultEmpty(id: number) {
        const field = new ObjectField();
        field.id = id;
        return field;
    }

    /**
     * 类型是否是数字类型
     */
    static typeIsNumber(type: number) {
        return type === ObjectFieldType.Double || type === ObjectFieldType.Integer;
    }

    /**
     * 类型是否是文本类型
     */
    static typeIsText(type: number) {
        return type === ObjectFieldType.Char || type === ObjectFieldType.Varchar;
    }

}

export class ObjectFieldIndex {

    static None = 0;

    static Index = 1;

    static Unique = 2;

}

export class ObjectFieldType {

    static Integer = 0
    static Double = 1
    static Char = 2
    static Varchar = 3
    static Boolean = 4
    static DateTime = 5

}

export class ObjectFieldSelectMode {

    static None = 0;

    static Equal = 1;

    static Like = 2;

    static Range = 3;

}

export class ObjectFieldSaveMode {

    static None = 0

    static OnlyAllSave = 1

    static OnlySingleSave = 2

    static AllAndSingleSave = 3

}