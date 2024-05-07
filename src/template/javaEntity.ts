/**
 * Java Entity模板
 */
export const JavaEntityTemplate =
    `// Please do not actively modify these files, please refer to the "https://github.com/YuQianhao/spring-generate" documentation.
package #PACKAGE_NAME#.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.lang.reflect.Field;
import java.util.*;
import org.springframework.lang.NonNull;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import #PACKAGE_NAME#.service.template.#CLASS_NAME#ServiceTemplate;

/**
 * #CLASS_CN_NAME#
 * #CLASS_COMMENTS#
 */
@TableName("#DB_TABLE_NAME#")
public class #CLASS_NAME# extends BaseEntity{

    #CLASS_ENTITY_FIELDS#
    public #CLASS_NAME#(){}

    #CLASS_ENTITY_GET_METHODS#

    #CLASS_ENTITY_SET_METHODS#
    
    public void save() {
        #CLASS_NAME#ServiceTemplate.getInstance().save(this);
    }

    @SafeVarargs
    public static #CLASS_NAME#ServiceTemplate.SelectHolder select(SFunction<#CLASS_NAME#, ?>... columns) {
        return #CLASS_NAME#ServiceTemplate.getInstance().select(columns);
    }

    public static #CLASS_NAME#ServiceTemplate.UpdateHolder operate() {
        return #CLASS_NAME#ServiceTemplate.getInstance().operate();
    }

    public static #CLASS_NAME#ServiceTemplate.RemoveHolder delete() {
        return #CLASS_NAME#ServiceTemplate.getInstance().delete();
    }
    
    public #CLASS_NAME#.Dynamic toDynamic() {
        return new Dynamic(this);
    }

    /**
     * 从{@code targetObject}指向的对象创建一个{#code #CLASS_NAME#}实例，并且复制与{@code this}对象拥有完全一样的字段签名的字段的值。
     */
    public static #CLASS_NAME# createWith(Object srcObject) {
        #CLASS_NAME# result = new #CLASS_NAME#();
        result.copyWith(srcObject);
        return result;
    }

    /**
     * 从{@code targetObject}对象中，复制与{@code this}对象拥有完全一样的字段签名的字段的值。
     */
    public void copyWith(Object srcObject) {
        if (srcObject == null) {
            return;
        }
        #CLASS_NAME# targetObject = this;
        try {
            Class<?> targetClass = targetObject.getClass();
            Field[] targetFields = targetClass.getDeclaredFields();
            Class<?> paramsClass = srcObject.getClass();
            Field[] paramsFields = paramsClass.getDeclaredFields();
            for (Field paramsField : paramsFields) {
                List<Field> targetValueFields = Arrays.stream(targetFields).filter(item -> item.getName().equals(paramsField.getName())).toList();
                for (Field targetField : targetValueFields) {
                    targetField.setAccessible(true);
                    if(targetField.getGenericType().equals(paramsField.getGenericType())){
                        targetField.set(targetObject, paramsField.get(srcObject));
                    }

                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }
    
    public static class Dynamic extends HashMap<String, Object> {

        private #CLASS_NAME# objectRef;

        private final Field[] fields;

        public Dynamic(@NonNull #CLASS_NAME# targetObject) {
            this.objectRef = targetObject;
            this.fields = targetObject.getClass().getDeclaredFields();
            parseObject();
        }
        
        private void parseObject() {
            clear();
            #DYNAMIC_PARSE_BODY#
        }

        public #CLASS_NAME# objectRef() {
            return this.objectRef;
        }

        private Object _getItem(@NonNull String key) {
            return get(key);
        }

        private void _setItem(@NonNull String key, Object value) {
            if (containsKey(key)) {
                remove(key);
            }
            put(key, value);
            notifyChange(key, value);
        }

        private void _removeItem(@NonNull String key) {
            remove(key);
            notifyChange(key, null);
        }
        
        #DYNAMIC_GET_VALUE#
        
        #DYNAMIC_SET_VALUE#
        
        #DYNAMIC_REMOVE_VALUE#

        /**
         * 通知{@code Map}有值发生变更，根据变更的情况修改当前对象引用的值
         *
         * @param key   key
         * @param value value
         */
        private void notifyChange(@NonNull String key, Object value) {
            try {
                for (Field field : fields) {
                    if (field.getName().equals(key)) {
                        field.setAccessible(true);
                        field.set(this, value);
                    }
                }
            } catch (Exception e) {
                throw new RuntimeException("无法对'#CLASS_NAME#'对象的'" + key + "'值进行修改。");
            }
        }
        
        public static List<#CLASS_NAME#.Dynamic> ofList(List<#CLASS_NAME#> objectList) {
            List<#CLASS_NAME#.Dynamic> result = new ArrayList<>();
            for (#CLASS_NAME# object : objectList) {
                result.add(new #CLASS_NAME#.Dynamic(object));
            }
            return result;
        }

        /**
         * 根据现在的值变更情况，创建一个全新的对象
         */
        public #CLASS_NAME# createNew() {
            Goods targetObject = new Goods();
            #DYNAMIC_CREATE_NEW_BODY#
            objectRef = targetObject;
            return targetObject;
        }

    }

}`;

export const JavaEntityGetMethodTemplate: string =
    `public #FIELD_TYPE# get#FIELD_NAME_FIRST_UPPER#() {
        return this.#FIELD_NAME#;
    }`;

export const JavaEntitySetMethodTemplate: string =
    `public void set#FIELD_NAME_FIRST_UPPER#(#FIELD_TYPE# #FIELD_NAME#){
        this.#FIELD_NAME# = #FIELD_NAME#;
     }
    `;

export const JavaEntityDynamicSetTemplate: string =
    `   public void set#FIELD_NAME_FIRST_UPPER#(#FIELD_TYPE# #FIELD_NAME#){
            this._setItem("#FIELD_NAME#",#FIELD_NAME#);
        }
    `

export const JavaEntityDynamicGetTemplate: string =
    `   public #FIELD_TYPE# get#FIELD_NAME_FIRST_UPPER#(){
            return (#FIELD_TYPE#)this._getItem("#FIELD_NAME#");
        }
        `

export const JavaEntityDynamicRemoveTemplate: string =
    `   public void remove#FIELD_NAME_FIRST_UPPER#(){
            this._removeItem("#FIELD_NAME#");
        }
    `

export const JavaBaseEntityTemplate: string =
    `// Please do not actively modify these files, please refer to the "https://github.com/YuQianhao/spring-generate" documentation.
package #PACKAGE_NAME#.entity;

public class BaseEntity {

    public BaseEntity() {
    }

}
`;