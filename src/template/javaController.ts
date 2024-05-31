/**
 * Java Controller文件的模板
 */
export const JavaControllerTemplate =
    `// Please do not actively modify these files, please refer to the "https://github.com/YuQianhao/spring-generate" documentation.
package #PACKAGE_NAME#.controller.template;

import java.util.*;
import java.util.Date;
import org.springframework.transaction.annotation.Transactional;
import #PACKAGE_NAME#.exception.template.SpringGenerateBusinessException;
import #PACKAGE_NAME#.entity.#CLASS_NAME#;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import #PACKAGE_NAME#.service.template.#CLASS_NAME#ServiceTemplate;
import com.baomidou.mybatisplus.core.metadata.IPage;

public class #CLASS_NAME#ControllerTemplate extends #CLASS_NAME#ServiceTemplate{

    protected static class #CLASS_NAME#_OnlyId {
        public Integer id;
        
        public void examine() {
            if (id == null) {
                throw new SpringGenerateBusinessException("要查询的对象'id'格式不正确，id通常为Integer类型的数据，并且不能是空的。");
            }
        }
    }   
    
    protected Object onHandleGetAfter(#CLASS_NAME#.Dynamic object) {
        return object;
    }
    
    @PostMapping("template/getEntity")
    public Object getEntity(@RequestBody #CLASS_NAME#_OnlyId onlyId) {
        onlyId.examine();
        return this.onHandleGetAfter(new #CLASS_NAME#.Dynamic(selectById(onlyId.id)));
    }  
    
    protected #CLASS_NAME# onHandleRemoveBefore(#CLASS_NAME# object) {
        if (object == null) {
            throw new SpringGenerateBusinessException("要删除的#TABLE_CN_NAME#对象不存在。");
        }
        return object;
    }

    protected Object onHandleRemoveAfter(#CLASS_NAME# object) {
        throw new SpringGenerateBusinessException("没有找到“onHandleRemoveAfter”方法的实现。");
    }
    
    @Transactional
    @PostMapping("template/remove")
    public Object remove(@RequestBody #CLASS_NAME#_OnlyId onlyId) {
        onlyId.examine();
        var object = selectById(onlyId.id);
        removeById(this.onHandleRemoveBefore(object).getId());
        object.setId(null);
        return this.onHandleRemoveAfter(object);
    }
    
    protected static class #CLASS_NAME#_Save{
        #SAVE_CLASS_BODY#
        
        public void examine(){
            #SAVE_CLASS_EXAMINE_BODY#
        }
    }
    
    protected #CLASS_NAME#_Save onHandleSaveParams(#CLASS_NAME#_Save save) {
        save.examine();
        return save;
    }
    
    protected #CLASS_NAME# onHandleSaveBefore(#CLASS_NAME# entity) {
        return entity;
    }

    protected Object onHandleSaveAfter(#CLASS_NAME# entity) {
        return entity;
    }
    
    @Transactional
    @PostMapping("template/save")
    public Object save(@RequestBody #CLASS_NAME#_Save params) {
        #CLASS_NAME#_Save save=this.onHandleSaveParams(params);
        #CLASS_NAME# object = new #CLASS_NAME#();
        #SAVE_METHOD_ASSIGN_BODY#
        save(this.onHandleSaveBefore(object));
        return this.onHandleSaveAfter(object);
    }
    
    #FIELD_SAVE_BODY#
    
    protected static class #CLASS_NAME#_Select{
        #SELECT_CLASS_FIELD_BODY#
        
        public #CLASS_NAME#_Select(Map<String,Object> params){
            #SELECT_CLASS_CONSTRUCTOR_BODY#
        }
    }
    
    #SELECT_HANDLE_METHOD#
    
    @PostMapping("template/select")
    public Object select(@RequestBody Map<String, Object> params) {
        var select = new #CLASS_NAME#_Select(params);
        if (select.#PAGE_FIELD_NAME# == null || select.#PAGE_FIELD_NAME# < 1) {
            throw new SpringGenerateBusinessException("字段'#PAGE_FIELD_NAME#'的值不能小于1，这个字段是Integer类型，在这里也不能是空的。");
        }
        if (select.#PAGE_SIZE_FIELD_NAME# == null || select.#PAGE_SIZE_FIELD_NAME# < 1 || select.#PAGE_SIZE_FIELD_NAME# > 20) {
            throw new SpringGenerateBusinessException("字段'#PAGE_SIZE_FIELD_NAME#'的值不能小于1，并且不能大于20，这个字段是Integer类型，在这里也不能是空的。");
        }
        
        #CLASS_NAME#ServiceTemplate.SelectHolder selectHolder=select();
        this.onHandleSelectBefore(select,params,selectHolder);
        #SELECT_METHOD_CALL_HANDLE_BODY#
        
        return onHandleSelectAfter(selectHolder.pageDynamic(select.#PAGE_FIELD#,select.#DATA_SIZE_FIELD#));
    }

}
`;

