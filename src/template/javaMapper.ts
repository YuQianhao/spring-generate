export const JavaMapperTemplate: string =
    `// Please do not actively modify these files, please refer to the "https://github.com/YuQianhao/spring-generate" documentation.
package #PACKAGE_NAME#.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import #PACKAGE_NAME#.entity.#CLASS_NAME#;

public interface #CLASS_NAME#Mapper extends BaseMapper<#CLASS_NAME#>{}`