import {CodeGenerate, ICodeGenerateAction} from "./CodeGenerate.ts";
import ProjectConfig from "../models/Project.ts";
import {ObjectTable} from "../models/ObjectTable.ts";
import {fs} from "@tauri-apps/api";
import {
    JavaBaseEntityTemplate,
    JavaEntityDynamicGetTemplate,
    JavaEntityDynamicRemoveTemplate,
    JavaEntityDynamicSetTemplate,
    JavaEntityGetMethodTemplate,
    JavaEntitySetMethodTemplate,
    JavaEntityTemplate
} from "../template/javaEntity.ts";
import {JavaMapperTemplate} from "../template/javaMapper.ts";
import {
    JavaHolderNotMatchSelectExceptionTemplate,
    JavaSpringGenerateBusinessExceptionTemplate
} from "../template/javaException.ts";
import {JavaServiceTemplate} from "../template/javaServiceTemplate.ts";
import {JavaControllerTemplate} from "../template/javaController.ts";
import {ObjectField, ObjectFieldSaveMode, ObjectFieldSelectMode} from "../models/ObjectField.ts";

/**
 * Java代码生成器
 */
export class JavaCodeGenerate implements ICodeGenerateAction {

    readonly generate: CodeGenerate;
    readonly project: ProjectConfig;


    constructor(generate: CodeGenerate, project: ProjectConfig) {
        this.generate = generate;
        this.project = project;
    }

    async onGenerate(table: ObjectTable): Promise<void> {
        await this.generateTemplate();
        await this.generateException();
        await this.generateController(table);
        await this.generateEntity(table);
        await this.generateMapper(table);
        await this.generateService(table);
    }

    /**
     * 获取Java源代码的实际根目录
     */
    projectJavaSrcPath(): string {
        return this.generate.makePath([this.project.projectPath, "src", "main", "java", this.generate.packagePath(this.project)])
    }

    /**
     * 检查Src路径是否存在，如果不存在，就创建
     * @param directorPath  路径
     */
    private async makeSrcDirector(directorPath: string): Promise<void> {
        if (!(await fs.exists(directorPath))) {
            await fs.createDir(directorPath, {recursive: true});
        }
    }

    /**
     * 生成异常
     */
    private async generateException(): Promise<void> {
        const templatePath = this.generate.makePath([this.projectJavaSrcPath(), "exception", "template"])
        // 检查路径是否存在
        await this.makeSrcDirector(templatePath)

        // 生成 HolderNotMatchSelectException 异常类
        const holderNotMatchSelectExceptionTemplatePath = this.generate.makePath([templatePath, "HolderNotMatchSelectException.java"]);
        if (!(await fs.exists(holderNotMatchSelectExceptionTemplatePath))) {
            await fs.writeTextFile(holderNotMatchSelectExceptionTemplatePath, JavaHolderNotMatchSelectExceptionTemplate.replaceAll("#PACKAGE_NAME#", this.project.packageName));
            this.generate.logI(`HolderNotMatchSelectException 生成成功`)
        }

        // 生成SpringGenerateBusinessException异常
        const springGenerateBusinessExceptionTemplatePath = this.generate.makePath([templatePath, "SpringGenerateBusinessException.java"]);
        if (!(await fs.exists(springGenerateBusinessExceptionTemplatePath))) {
            await fs.writeTextFile(springGenerateBusinessExceptionTemplatePath, JavaSpringGenerateBusinessExceptionTemplate.replaceAll("#PACKAGE_NAME#", this.project.packageName));
            this.generate.logI(`SpringGenerateBusinessException 生成成功`)
        }
    }

    /**
     * 生成Controller
     */
    private async generateController(table: ObjectTable): Promise<void> {
        let controllerStatement = JavaControllerTemplate.replaceAll("#PACKAGE_NAME#", this.project.packageName);
        controllerStatement = controllerStatement.replaceAll("#CLASS_NAME#", table.tableName);

        // 创建SaveClassBody，SaveClassExamine、SaveMethodAssignBody和FieldSaveBody
        let saveClassBody = ""
        let saveClassExamine = ""
        let saveMethodAssignBody = ""
        let fieldSaveBody = ""
        for (const field of table.fields) {
            // 生成'Save'参数类的字段检查代码，仅生成'添加到save'接口中的字段
            if (field.saveParamsType == ObjectFieldSaveMode.AllAndSingleSave || field.saveParamsType == ObjectFieldSaveMode.OnlyAllSave) {
                saveClassBody += `\t\tpublic ${this.generate.javaType(field.fieldType)} ${field.fieldName};\n`;
                if (!field.primaryKey) {
                    // 判断字段是否为空
                    if (!field.allowNull) {
                        saveClassExamine += `
                            if(this.${field.fieldName} == null){
                                throw new RuntimeException("字段'${field.fieldName}'不能为空。");
                            }
                    `;
                    }
                    // 字符串的长度检查
                    if (ObjectField.typeIsText(field.fieldType)) {
                        saveClassExamine += `
                            if(this.${field.fieldName} !=null && ( this.${field.fieldName}.length() < ${field.minLength} || this.${field.fieldName}.length() > ${field.maxLength} )){
                                throw new RuntimeException("字段'${field.fieldName}'长度格式不正确，合法的长度范围是${field.minLength}-${field.maxLength}。");
                            }
                    `;
                    } else if (ObjectField.typeIsNumber(field.fieldType)) {
                        // 数字类型的范围检查
                        saveClassExamine += `
                            if(this.${field.fieldName} !=null && ( this.${field.fieldName} < ${field.minValue} || this.${field.fieldName} > ${field.maxValue} )){
                                throw new RuntimeException("字段'${field.fieldName}'的值格式不正确，合法的值范围是${field.minValue}-${field.maxValue}。");
                            }
                    `;
                    }
                }
            }
            // 生成'save'接口中，为对象赋值的代码
            if (field.allowNull) {
                if (field.saveParamsType == ObjectFieldSaveMode.OnlyAllSave || field.saveParamsType == ObjectFieldSaveMode.AllAndSingleSave) {
                    saveMethodAssignBody += `object.set${this.generate.firstCaseUpper(field.fieldName)}(save.${field.fieldName});\n`
                } else {
                    saveMethodAssignBody += `object.set${this.generate.firstCaseUpper(field.fieldName)}(null);\n`
                }
            } else {
                if (field.saveParamsType == ObjectFieldSaveMode.OnlyAllSave || field.saveParamsType == ObjectFieldSaveMode.AllAndSingleSave) {
                    saveMethodAssignBody += `object.set${this.generate.firstCaseUpper(field.fieldName)}(save.${field.fieldName});\n`
                } else {
                    throw new Error(`字段'${field.fieldName}'在在生成时发生错误，字段不允许为空，但是没有加入'save'接口规则，导致'save'接口无法创建这个对象。如果想让这个字段不加入'save'接口，请设置为可空。`);
                }
            }
            // 生成单独生成save接口的字段，忽略主键字段
            if (!field.primaryKey && (field.saveParamsType == ObjectFieldSaveMode.OnlySingleSave || field.saveParamsType == ObjectFieldSaveMode.AllAndSingleSave)) {

                const firstUpperFieldName = this.generate.firstCaseUpper(field.fieldName);

                fieldSaveBody += `
                protected static class FieldSave_${firstUpperFieldName}{
                    public Integer id;
                    public ${this.generate.javaType(field.fieldType)} ${field.fieldName};
                    
                    public void examine(){
                        if(id==null){
                            throw new RuntimeException("字段'id'不能为空。");
                        }
                        ${!field.allowNull ? `
                        if(this.${field.fieldName} == null){
                            throw new RuntimeException("字段'${field.fieldName}'不能为空。");
                        }
                        ` : ''}
                        ${ObjectField.typeIsText(field.fieldType) ? `
                        if(this.${field.fieldName} != null && (this.${field.fieldName}.length() < ${field.minLength} || this.${field.fieldName}.length() > ${field.maxLength} )){
                            throw new RuntimeException("字段'${field.fieldName}'长度格式不正确，合法的长度范围是${field.minLength}-${field.maxLength}。");
                        }
                        ` : ''}
                        ${ObjectField.typeIsNumber(field.fieldType) ? `
                        if(this.${field.fieldName} != null && (this.${field.fieldName} < ${field.minValue} || this.${field.fieldName} > ${field.maxValue} )){
                            throw new RuntimeException("字段'${field.fieldName}'的值不正确，合法的值范围是${field.minValue}-${field.maxValue}。");
                        }
                        ` : ''}
                    }
                }
                
                protected FieldSave_${firstUpperFieldName} onHandleFieldSave${firstUpperFieldName}(FieldSave_${firstUpperFieldName} save) {
                    save.examine();
                    return save;
                }
                
                protected ${table.tableName} onHandleFieldSave${firstUpperFieldName}Before(${table.tableName} entity) {
                    return entity;
                }
            
                protected Object onHandleFieldSave${firstUpperFieldName}After(${table.tableName} entity) {
                    return entity;
                }
                
                @Transactional
                @PostMapping("template/set${firstUpperFieldName}")
                public Object set(@RequestBody FieldSave_${firstUpperFieldName} params) {
                    FieldSave_${firstUpperFieldName} save = this.onHandleFieldSave${firstUpperFieldName}(params);
                    ${table.tableName} object = selectByIdNotNull(params.id);
                    object.set${firstUpperFieldName}(save.${field.fieldName});
                    save(this.onHandleFieldSave${firstUpperFieldName}Before(object));
                    return this.onHandleFieldSave${firstUpperFieldName}After(object);
                }
                
                `;
            }
        }
        controllerStatement = controllerStatement.replaceAll("#SAVE_CLASS_BODY#", saveClassBody);
        controllerStatement = controllerStatement.replaceAll("#SAVE_CLASS_EXAMINE_BODY#", saveClassExamine);
        controllerStatement = controllerStatement.replaceAll("#SAVE_METHOD_ASSIGN_BODY#", saveMethodAssignBody);
        controllerStatement = controllerStatement.replaceAll("#FIELD_SAVE_BODY#", fieldSaveBody);

        // 生成SelectClass字段代码
        let selectClassStatement = ""
        // SelectClass的构造方法
        let selectClassConstructorStatement = ""
        // 生成SelectHandle方法代码
        let selectHandleMethodStatement = ""
        // 生成Select方法内部的Handle调用
        let selectHandleCallStatement = "";
        for (const field of table.fields) {
            if (field.selectType !== ObjectFieldSelectMode.None) {
                if (field.selectType === ObjectFieldSelectMode.Range) {
                    selectClassStatement += `public ${this.generate.javaType(field.fieldType)} ${field.fieldName}Start;\n`;
                    selectClassStatement += `public ${this.generate.javaType(field.fieldType)} ${field.fieldName}End;\n`;
                    selectClassConstructorStatement += `
                    if (params.containsKey("${field.fieldName}Start")) {
                        this.${field.fieldName}Start = (${this.generate.javaType(field.fieldType)}) params.get("${field.fieldName}Start");
                    }else{
                        this.${field.fieldName}Start = null;
                    }
                    if (params.containsKey("${field.fieldName}End")) {
                        this.${field.fieldName}End = (${this.generate.javaType(field.fieldType)}) params.get("${field.fieldName}End");
                    }else{
                        this.${field.fieldName}End = null;
                    }
                    `;
                    selectHandleMethodStatement += `
                        protected void onHandleSelect${this.generate.firstCaseUpper(field.fieldName)}Params(${table.tableName}_Select select,
                                          Map<String,Object> params,
                                          ${table.tableName}ServiceTemplate.SelectHolder selectHolder){
                            if(select.${field.fieldName}Start!=null ${ObjectField.typeIsText(field.fieldType) ? `&& select.${field.fieldName}Start.length() > 0` : ''}){
                                selectHolder.ge(${table.tableName}::get${this.generate.firstCaseUpper(field.fieldName)},select.${field.fieldName}Start);
                            }
                            if(select.${field.fieldName}End!=null ${ObjectField.typeIsText(field.fieldType) ? `&& select.${field.fieldName}Start.length() > 0` : ''}){
                                selectHolder.le(${table.tableName}::get${this.generate.firstCaseUpper(field.fieldName)},select.${field.fieldName}End);
                            }
                        }
                    `;
                } else {
                    selectClassStatement += `public ${this.generate.javaType(field.fieldType)} ${field.fieldName};\n`;
                    selectClassConstructorStatement += `
                    if (params.containsKey("${field.fieldName}")) {
                        this.${field.fieldName} = (${this.generate.javaType(field.fieldType)}) params.get("${field.fieldName}");
                    }else{
                        this.${field.fieldName} = null;
                    }
                    `;
                    selectHandleMethodStatement += `
                        protected void onHandleSelect${this.generate.firstCaseUpper(field.fieldName)}Params(${table.tableName}_Select select,
                                          Map<String,Object> params,
                                          ${table.tableName}ServiceTemplate.SelectHolder selectHolder){
                                          
                            ${field.selectType === ObjectFieldSelectMode.Like ? `
                            if(select.${field.fieldName}!=null ${ObjectField.typeIsText(field.fieldType) ? `&& select.${field.fieldName}.length() > 0` : ''}){
                                selectHolder.like(${table.tableName}::get${this.generate.firstCaseUpper(field.fieldName)},select.${field.fieldName});
                            }
                            ` : ''}
                            
                            ${field.selectType === ObjectFieldSelectMode.Equal ? `
                            if(select.${field.fieldName}!=null ${ObjectField.typeIsText(field.fieldType) ? `&& select.${field.fieldName}.length() > 0` : ''}){
                                selectHolder.eq(${table.tableName}::get${this.generate.firstCaseUpper(field.fieldName)},select.${field.fieldName});
                            }
                            ` : ''}
                        }
                    `;
                }
                selectHandleCallStatement += `
                        this.onHandleSelect${this.generate.firstCaseUpper(field.fieldName)}Params(select,params,selectHolder);
                    `;
            }
        }

        // 分页页码和分页长度字段
        const pageFieldName = this.project.pageFieldName;
        const pageSizeFieldName = this.project.pageSizeFieldName;
        selectClassStatement += `
            public Integer ${pageFieldName};
            public Integer ${pageSizeFieldName};
        `;
        // 增加SelectClass构造方法中分页和页码字段的赋值
        selectClassConstructorStatement += `
                    if (params.containsKey("${pageFieldName}")) {
                        this.${pageFieldName} = (Integer) params.get("${pageFieldName}");
                    }else{
                        this.${pageFieldName} = null;
                    }
                    if (params.containsKey("${pageSizeFieldName}")) {
                        this.${pageSizeFieldName} = (Integer) params.get("${pageSizeFieldName}");
                    }else{
                        this.${pageSizeFieldName} = null;
                    }
                    `;

        selectHandleMethodStatement += `
        protected ${table.tableName}ServiceTemplate.SelectHolder onHandleSelectBefore(${table.tableName}_Select select, Map<String, Object> params, ${table.tableName}ServiceTemplate.SelectHolder selectHolder) {
            return selectHolder;
        }
        
        protected Object onHandleSelectAfter(IPage<${table.tableName}.Dynamic> result) {
            return result;
        }
        `;
        controllerStatement = controllerStatement.replaceAll("#SELECT_CLASS_FIELD_BODY#", selectClassStatement);
        controllerStatement = controllerStatement.replaceAll("#SELECT_CLASS_CONSTRUCTOR_BODY#", selectClassConstructorStatement);
        controllerStatement = controllerStatement.replaceAll("#SELECT_HANDLE_METHOD#", selectHandleMethodStatement)
        controllerStatement = controllerStatement.replaceAll("#PAGE_FIELD_NAME#", pageFieldName)
        controllerStatement = controllerStatement.replaceAll("#PAGE_SIZE_FIELD_NAME#", pageSizeFieldName)
        controllerStatement = controllerStatement.replaceAll("#SELECT_METHOD_CALL_HANDLE_BODY#", selectHandleCallStatement);

        // 替换分页字段
        controllerStatement = controllerStatement.replaceAll("#PAGE_FIELD#", pageFieldName);
        controllerStatement = controllerStatement.replaceAll("#DATA_SIZE_FIELD#", pageSizeFieldName);

        // 去除多余空行
        controllerStatement = controllerStatement.replace(/(\r?\n[^\S\n]*){2,}/g, '\n\n');

        const controllerPath = this.generate.makePath([this.projectJavaSrcPath(), "controller", "template", `${table.tableName}ControllerTemplate.java`]);
        await fs.writeTextFile(controllerPath, controllerStatement)

        this.generate.logI(`${table.tableName}ControllerTemplate 生成成功`)
    }

    /**
     * 生成Template模板
     */
    private async generateTemplate(): Promise<void> {
        const templatePath = this.generate.makePath([this.projectJavaSrcPath(), "service", "template"])
        await this.makeSrcDirector(templatePath)

        // 检查“BaseEntity”是否存在，不存在就生成
        const entityPath = this.generate.makePath([this.projectJavaSrcPath(), "entity"])
        await this.makeSrcDirector(entityPath)

        // 创建 BaseEntity
        const baseEntityPath = this.generate.makePath([entityPath, "BaseEntity.java"])
        if (!(await fs.exists(baseEntityPath))) {
            await fs.writeTextFile(baseEntityPath, JavaBaseEntityTemplate.replaceAll("#PACKAGE_NAME#", this.project.packageName));
            this.generate.logI(`BaseEntity 生成成功`)
        }

        // 创建Controller目录
        const controllerPath = this.generate.makePath([this.projectJavaSrcPath(), "controller", "template"])
        await this.makeSrcDirector(controllerPath)
    }

    /**
     * 生成Service相关文件
     */
    private async generateService(table: ObjectTable): Promise<void> {
        const templatePath = this.generate.makePath([this.projectJavaSrcPath(), "service", "template"])
        await this.makeSrcDirector(templatePath)

        // 生成Java Service文件
        let serviceTemplate = JavaServiceTemplate.replaceAll("#PACKAGE_NAME#", this.project.packageName)
        serviceTemplate = serviceTemplate.replaceAll("#CLASS_NAME#", table.tableName)
        serviceTemplate = serviceTemplate.replaceAll("#TABLE_CN_NAME#", table.tableCnName)
        const servicePath = this.generate.makePath([templatePath, this.generate.firstCaseUpper(table.tableName) + "ServiceTemplate.java"]);
        await fs.writeTextFile(servicePath, serviceTemplate);
        this.generate.logI(`${table.tableName}ServiceTemplate 生成成功`)
    }

    /**
     * 生成Mapper代码
     */
    private async generateMapper(table: ObjectTable): Promise<void> {
        const directorPath = this.generate.makePath([this.projectJavaSrcPath(), "mapper"])
        await this.makeSrcDirector(directorPath)

        let mapperTemplate = JavaMapperTemplate.replaceAll("#PACKAGE_NAME#", this.project.packageName);
        mapperTemplate = mapperTemplate.replaceAll("#CLASS_NAME#", table.tableName)

        await fs.writeFile(this.generate.makePath([directorPath, table.tableName + "Mapper.java"]), mapperTemplate);
        this.generate.logI(`${table.tableName}Mapper 生成成功`)
    }

    /**
     * 生成Entity代码
     */
    private async generateEntity(table: ObjectTable): Promise<void> {
        const directorPath = this.generate.makePath([this.project.projectPath, "src", "main", "java", this.generate.packagePath(this.project), "entity"])
        await this.makeSrcDirector(directorPath)

        let entityTemplate = JavaEntityTemplate.replaceAll("#PACKAGE_NAME#", this.project.packageName);
        entityTemplate = entityTemplate.replaceAll("#CLASS_NAME#", table.tableName);
        entityTemplate = entityTemplate.replaceAll("#DB_TABLE_NAME#", this.generate.databaseNameFormat(table.tableName, this.project));
        entityTemplate = entityTemplate.replaceAll("#CLASS_CN_NAME#", table.tableCnName);
        entityTemplate = entityTemplate.replaceAll("#CLASS_COMMENTS#", table.tableComments);

        // 生成Field列表
        let fieldStatement = "";
        for (let field of table.fields) {
            fieldStatement += `${fieldStatement.length === 0 ? '' : '\t'}/**\t\n\t * ${field.fieldCnName}\n\t */\n`;
            if (field.primaryKey) {
                fieldStatement += `\t@TableId(value = "${this.generate.databaseNameFormat(field.fieldName, this.project)}", type = IdType.AUTO)\n`;
            } else {
                fieldStatement += `\t@TableField(value = "${this.generate.databaseNameFormat(field.fieldName, this.project)}")\n`;
            }
            fieldStatement += `\tprivate ${this.generate.javaType(field.fieldType)} ${field.fieldName};\n\n`;
        }
        // 移除最后一个换行符
        fieldStatement = fieldStatement.substring(0, fieldStatement.length - 1);
        entityTemplate = entityTemplate.replaceAll("#CLASS_ENTITY_FIELDS#", fieldStatement);

        // 生成get方法列表
        let fieldGetStatement = "";
        for (let field of table.fields) {
            let fieldGetFragment = JavaEntityGetMethodTemplate.replaceAll("#FIELD_TYPE#", this.generate.javaType(field.fieldType));
            fieldGetFragment = fieldGetFragment.replaceAll("#FIELD_NAME_FIRST_UPPER#", this.generate.firstCaseUpper(field.fieldName));
            fieldGetFragment = fieldGetFragment.replaceAll("#FIELD_NAME#", field.fieldName);
            fieldGetStatement += `${fieldGetStatement.length === 0 ? '' : '\t'}${fieldGetFragment}\n\n`;
        }
        entityTemplate = entityTemplate.replaceAll("#CLASS_ENTITY_GET_METHODS#", fieldGetStatement);

        // 生成set方法列表
        let fieldSetStatement = "";
        for (let field of table.fields) {
            let fieldSetFragment = JavaEntitySetMethodTemplate.replaceAll("#FIELD_TYPE#", this.generate.javaType(field.fieldType));
            fieldSetFragment = fieldSetFragment.replaceAll("#FIELD_NAME_FIRST_UPPER#", this.generate.firstCaseUpper(field.fieldName));
            fieldSetFragment = fieldSetFragment.replaceAll("#FIELD_NAME#", field.fieldName);
            fieldSetStatement += `${fieldSetStatement.length === 0 ? '' : '\t'}${fieldSetFragment}\n`;
        }
        entityTemplate = entityTemplate.replaceAll("#CLASS_ENTITY_SET_METHODS#", fieldSetStatement);

        // 生成Dynamic类的get方法
        let dynamicFieldGetStatement = "";
        for (let field of table.fields) {
            let dynamicFieldSetFragment = JavaEntityDynamicGetTemplate.replaceAll("#FIELD_TYPE#", this.generate.javaType(field.fieldType));
            dynamicFieldSetFragment = dynamicFieldSetFragment.replaceAll("#FIELD_NAME_FIRST_UPPER#", this.generate.firstCaseUpper(field.fieldName));
            dynamicFieldSetFragment = dynamicFieldSetFragment.replaceAll("#FIELD_NAME#", field.fieldName);
            dynamicFieldGetStatement += `${dynamicFieldGetStatement.length === 0 ? '' : '\t'}${dynamicFieldSetFragment}\n`;
        }
        entityTemplate = entityTemplate.replaceAll("#DYNAMIC_GET_VALUE#", dynamicFieldGetStatement);

        // 生成Dynamic类的set方法
        let dynamicFieldSetStatement = "";
        for (let field of table.fields) {
            let dynamicFieldSetFragment = JavaEntityDynamicSetTemplate.replaceAll("#FIELD_TYPE#", this.generate.javaType(field.fieldType));
            dynamicFieldSetFragment = dynamicFieldSetFragment.replaceAll("#FIELD_NAME_FIRST_UPPER#", this.generate.firstCaseUpper(field.fieldName));
            dynamicFieldSetFragment = dynamicFieldSetFragment.replaceAll("#FIELD_NAME#", field.fieldName);
            dynamicFieldSetStatement += `${dynamicFieldSetStatement.length === 0 ? '' : '\t'}${dynamicFieldSetFragment}\n`;
        }
        entityTemplate = entityTemplate.replaceAll("#DYNAMIC_SET_VALUE#", dynamicFieldSetStatement);

        // 生成Dynamic类的remove方法
        let dynamicFieldRemoveStatement = "";
        for (let field of table.fields) {
            let dynamicFieldSetFragment = JavaEntityDynamicRemoveTemplate.replaceAll("#FIELD_TYPE#", this.generate.javaType(field.fieldType));
            dynamicFieldSetFragment = dynamicFieldSetFragment.replaceAll("#FIELD_NAME_FIRST_UPPER#", this.generate.firstCaseUpper(field.fieldName));
            dynamicFieldSetFragment = dynamicFieldSetFragment.replaceAll("#FIELD_NAME#", field.fieldName);
            dynamicFieldRemoveStatement += `${dynamicFieldRemoveStatement.length === 0 ? '' : '\t'}${dynamicFieldSetFragment}\n`;
        }
        entityTemplate = entityTemplate.replaceAll("#DYNAMIC_REMOVE_VALUE#", dynamicFieldRemoveStatement);

        // 生成Dynamic类的parseObject方法
        let dynamicParseMethodBody = "";
        for (let field of table.fields) {
            dynamicParseMethodBody += `put("${field.fieldName}", objectRef.get${this.generate.firstCaseUpper(field.fieldName)}());\n`;
        }
        entityTemplate = entityTemplate.replaceAll("#DYNAMIC_PARSE_BODY#", dynamicParseMethodBody);

        // 生成Dynamic类的createNew方法
        let dynamicCreateNewMethodBody = "";
        for (let field of table.fields) {
            dynamicCreateNewMethodBody += `if(get("${field.fieldName}")!=null){
                targetObject.set${this.generate.firstCaseUpper(field.fieldName)}((${this.generate.javaType(field.fieldType)}) get("${field.fieldName}"));
            }\n`;
        }
        entityTemplate = entityTemplate.replaceAll("#DYNAMIC_CREATE_NEW_BODY#", dynamicCreateNewMethodBody);

        // 清除所有多余的换行符
        entityTemplate = entityTemplate.replaceAll("\n\n\n", "\n");

        // 写出entity文件
        await fs.writeFile(this.generate.makePath([directorPath, table.tableName + ".java"]), entityTemplate);

        this.generate.logI(`${table.tableName} 生成成功`)
    }

}