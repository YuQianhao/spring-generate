/**
 * HolderNotMatchSelectException异常模板文件
 */
export const JavaHolderNotMatchSelectExceptionTemplate: string =
    `// Please do not actively modify these files, please refer to the "https://github.com/YuQianhao/spring-generate" documentation.
package #PACKAGE_NAME#.service.template;

/**
 * 在{@code select}的所有{@code 非空查询}中，如果查询到空的对象，将会抛出这个异常。
 */
public class HolderNotMatchSelectException extends RuntimeException {

    private final String tableCnName;

    public HolderNotMatchSelectException(String tableCnName) {
        super("没有查询到合适的'" + tableCnName + "'对象。");
        this.tableCnName = tableCnName;
    }

    public String getTableCnName() {
        return this.tableCnName;
    }
}
`;