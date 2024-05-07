/**
 * JavaService模板文件
 */
export const JavaServiceTemplate: string =
    `// Please do not actively modify these files, please refer to the "https://github.com/YuQianhao/spring-generate" documentation.
package #PACKAGE_NAME#.service.template;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import #PACKAGE_NAME#.entity.#CLASS_NAME#;
import #PACKAGE_NAME#.mapper.#CLASS_NAME#Mapper;
import jakarta.annotation.PostConstruct;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.function.Consumer;

@Component
public class #CLASS_NAME#ServiceTemplate extends ServiceImpl<#CLASS_NAME#Mapper, #CLASS_NAME#> {

    private final String tableCnName = "#TABLE_CN_NAME#";
    
    private static #CLASS_NAME#ServiceTemplate __sp__instance;

    @PostConstruct
    private void __sp__instance_init() {
        __sp__instance = this;
    }

    public static #CLASS_NAME#ServiceTemplate getInstance() {
        if (__sp__instance == null) {
            throw new RuntimeException("#CLASS_NAME#ServiceTemplate没有在Spring生命周期中得到正确的初始化。");
        }
        return __sp__instance;
    }

    /**
     * 保存数据结构。
     * <p>
     * 如果要保存的数据结构内容的{@code id}字段是{@code null}，会视为{@code 添加一行}，调用{@code Mapper#insert}，
     * 反之将视为{@code 更新一行}，调用{@code Mapper#updateById}。
     * </p>
     *
     * @param object 要保存的数据结构对象
     * @return 保存成功是将会返回 {@code true}。
     * @throws RuntimeException 这个方法中捕获到的所有异常，都将转换为{@code 运行时异常}抛出。
     */
    @NonNull
    public final boolean save(@NonNull #CLASS_NAME# object) {
        try {
            Class<?> clazz = object.getClass();
            var field = clazz.getDeclaredField("id");
            field.setAccessible(true);
            if (field.get(object) == null) {
                return getBaseMapper().insert(object) > 0;
            } else {
                return getBaseMapper().updateById(object) > 0;
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 根据{@code id}删除一行
     *
     * @param id 要删除的对象 {@code id}
     * @return 删除成功时将会返回 {@code true}。
     */
    @NonNull
    public final boolean removeById(@NonNull Integer id) {
        return getBaseMapper().deleteById(id) > 0;
    }

    /**
     * 根据{@code id}查询一行
     *
     * @param id 要查询的对象 {@code id}
     * @return 返回查询到的对象引用，可能返回 {@code null}。
     */
    public final #CLASS_NAME# selectById(@NonNull Integer id) {
        return getById(id);
    }

    public final #CLASS_NAME#.Dynamic selectDynamicById(@NonNull Integer id) {
        #CLASS_NAME# object = selectById(id);
        if (object == null) {
            return null;
        }
        return new #CLASS_NAME#.Dynamic(selectById(id));
    }

    /**
     * 根据{@code id}查询一行，并且保证返回的数据一定不是 {@code null}。
     *
     * @param id 要查询的对象 {@code id}
     * @return 返回查询到的对象引用，发你的引用一定不是 {@code null}，如果查询到的对象不存在，将会抛出 {@link HolderNotMatchSelectException}。
     * @throws HolderNotMatchSelectException 查询到的对象不存在。
     */
    @NonNull
    public final #CLASS_NAME# selectByIdNotNull(@NonNull Integer id) {
        #CLASS_NAME# result = selectById(id);
        if (result == null) {
            throw new HolderNotMatchSelectException(tableCnName);
        }
        return result;
    }

    @NonNull
    public final #CLASS_NAME#.Dynamic selectDynamicByIdNotNull(@NonNull Integer id) {
        #CLASS_NAME# object = selectById(id);
        if (object == null) {
            throw new HolderNotMatchSelectException(tableCnName);
        }
        return new #CLASS_NAME#.Dynamic(object);
    }


    /**
     * 查询匹配条件的{@code 第一条数据}
     *
     * @param key   当前数据结构的字段列 {@link SFunction} 引用，通常直接引用 {@code get}方法，例如 {@code User::getName}。
     * @param value 要匹配的值，这个值一定不能是 {@code null}。
     * @return 返回查询到的结果
     */
    public final #CLASS_NAME# selectFirst(@NonNull SFunction<#CLASS_NAME#, ?> key, @NonNull Object value) {
        return select().eq(key, value).first();
    }

    public final #CLASS_NAME#.Dynamic selectDynamicFirst(@NonNull SFunction<#CLASS_NAME#, ?> key, @NonNull Object value) {
        #CLASS_NAME# object = selectFirst(key, value);
        if (object == null) {
            return null;
        }
        return new #CLASS_NAME#.Dynamic(object);
    }

    /**
     * 查询匹配条件的{@code 第一条数据}，查询到的结果一定不是 {@code null}
     *
     * @param key   当前数据结构的字段列 {@link SFunction} 引用，通常直接引用 {@code get}方法，例如 {@code User::getName}。
     * @param value 要匹配的值，这个值一定不能是 {@code null}。
     * @return 返回查询到的结果，查询到的结果一定不是 {@code null}，如果查询不到对象将会直接抛出 {@link HolderNotMatchSelectException}。
     * @throws HolderNotMatchSelectException 查询到的对象不存在。
     */
    @NonNull
    public final #CLASS_NAME# selectFirstNotNull(@NonNull SFunction<#CLASS_NAME#, ?> key, @NonNull Object value) {
        #CLASS_NAME# object = selectFirst(key, value);
        if (object == null) {
            throw new HolderNotMatchSelectException(tableCnName);
        }
        return object;
    }

    @NonNull
    public final #CLASS_NAME#.Dynamic selectDynamicFirstNotNull(@NonNull SFunction<#CLASS_NAME#, ?> key, @NonNull Object value) {
        #CLASS_NAME# object = selectFirst(key, value);
        if (object == null) {
            throw new HolderNotMatchSelectException(tableCnName);
        }
        return new #CLASS_NAME#.Dynamic(object);
    }

    /**
     * 查询匹配条件的{@code 唯一一条数据}
     *
     * @param key   当前数据结构的字段列 {@link SFunction} 引用，通常直接引用 {@code get}方法，例如 {@code User::getName}。
     * @param value 要匹配的值，这个值一定不能是 {@code null}。
     * @return 返回查询到的结果
     */
    public final #CLASS_NAME# selectOne(@NonNull SFunction<#CLASS_NAME#, ?> key, @NonNull Object value) {
        return select().eq(key, value).one();
    }

    public final #CLASS_NAME#.Dynamic selectDynamicOne(@NonNull SFunction<#CLASS_NAME#, ?> key, @NonNull Object value) {
        #CLASS_NAME# object = selectOne(key, value);
        if (object == null) {
            return null;
        }
        return new #CLASS_NAME#.Dynamic(object);
    }

    /**
     * 查询匹配条件的{@code 唯一一条数据}，查询到的结果一定不是 {@code null}
     *
     * @param key   当前数据结构的字段列 {@link SFunction} 引用，通常直接引用 {@code get}方法，例如 {@code User::getName}。
     * @param value 要匹配的值，这个值一定不能是 {@code null}。
     * @return 返回查询到的结果，查询到的结果一定不是 {@code null}，如果查询不到对象将会直接抛出 {@link HolderNotMatchSelectException}。
     * @throws HolderNotMatchSelectException 查询到的对象不存在。
     */
    @NonNull
    public final #CLASS_NAME# selectOneNotNull(@NonNull SFunction<#CLASS_NAME#, ?> key, @NonNull Object value) {
        #CLASS_NAME# object = selectOne(key, value);
        if (object == null) {
            throw new HolderNotMatchSelectException(tableCnName);
        }
        return object;
    }

    @NonNull
    public final #CLASS_NAME#.Dynamic selectDynamicNotNull(@NonNull SFunction<#CLASS_NAME#, ?> key, @NonNull Object value) {
        #CLASS_NAME# object = selectOne(key, value);
        if (object == null) {
            throw new HolderNotMatchSelectException(tableCnName);
        }
        return new #CLASS_NAME#.Dynamic(object);
    }

    /**
     * 查询匹配条件的{@code 虽有数据}
     *
     * @param key   当前数据结构的字段列 {@link SFunction} 引用，通常直接引用 {@code get}方法，例如 {@code User::getName}。
     * @param value 要匹配的值，这个值一定不能是 {@code null}。
     * @return 返回查询到的结果列表
     */
    @NonNull
    public final List<#CLASS_NAME#> selectList(@NonNull SFunction<#CLASS_NAME#, ?> key, @NonNull Object value) {
        return select().eq(key, value).list();
    }

    @NonNull
    public final List<#CLASS_NAME#.Dynamic> selectDynamicList(@NonNull SFunction<#CLASS_NAME#, ?> key, @NonNull Object value) {
        return #CLASS_NAME#.Dynamic.ofList(selectList(key, value));
    }

    /**
     * 查询匹配条件的{@code 数据数量}
     *
     * @param key   当前数据结构的字段列 {@link SFunction} 引用，通常直接引用 {@code get}方法，例如 {@code User::getName}。
     * @param value 要匹配的值，这个值一定不能是 {@code null}。
     * @return 返回查询到的结果数量
     */
    @NonNull
    public final Long selectCount(@NonNull SFunction<#CLASS_NAME#, ?> key, @NonNull Object value) {
        return select().eq(key, value).count();
    }

    /**
     * 查询所有的数据数量
     *
     * @return 数据数量
     */
    @NonNull
    public final Long selectCount() {
        return count();
    }

    /**
     * 查询所有的数据
     *
     * @return 虽有数据的列表
     */
    @NonNull
    public final List<#CLASS_NAME#> selectAll() {
        return list();
    }

    @NonNull
    public final List<#CLASS_NAME#.Dynamic> selectDynamicAll() {
        return #CLASS_NAME#.Dynamic.ofList(selectAll());
    }

    /**
     * 根据条件删除匹配的{@code 所有对象}
     *
     * @param key   当前数据结构的字段列 {@link SFunction} 引用，通常直接引用 {@code get}方法，例如 {@code User::getName}。
     * @param value 要匹配的值，这个值一定不能是 {@code null}。
     * @return 返回为 {@code true}时表示删除成功。
     */
    @NonNull
    public final boolean remove(@NonNull SFunction<#CLASS_NAME#, ?> key, @NonNull Object value) {
        return remove(new LambdaQueryWrapper<#CLASS_NAME#>().eq(key, value));
    }

    /**
     * 创建一个{@link SelectHolder}对象，这个对象适用于{@code 复杂的查询条件}和{@code 链式查询}。
     *
     * @param columns 限定要查询的字段，支持不定数量的字段列。如果不指定要查询的字段列，默认查询全部的。字段列使用 {@link SFunction} 的引用实现，通常直接引用 {@code get}方法，例如 {@code User::getName}。
     * @return 返回创建好的 {@link SelectHolder}对象。
     */
    @SafeVarargs
    @NonNull
    public final SelectHolder select(SFunction<#CLASS_NAME#, ?>... columns) {

        LambdaQueryWrapper<#CLASS_NAME#> wrapper = new LambdaQueryWrapper<>();

        if (columns.length > 0) {
            wrapper.select(columns);
        }

        return new SelectHolder(new LambdaQueryWrapper<>(), this);
    }

    /**
     * 创建一个{@link UpdateHolder}对象，这个对象能够实现{@code 复杂条件}下的{@code 更新}操作。
     *
     * @return {@link UpdateHolder}引用
     */
    @NonNull
    public final UpdateHolder operate() {
        return new UpdateHolder(new LambdaUpdateWrapper<>(), this);
    }

    /**
     * 创建一个{@link RemoveHolder}对象，这个对象能够实现{@code 复杂条件}下的{@code 删除}操作。
     *
     * @return {@link RemoveHolder}引用
     */
    @NonNull
    public final RemoveHolder delete() {
        return new RemoveHolder(new LambdaQueryWrapper<>(), this);
    }

    public static class SelectHolder {

        private final LambdaQueryWrapper<#CLASS_NAME#> wrapper;

        private final IService<#CLASS_NAME#> service;

        public SelectHolder(LambdaQueryWrapper<#CLASS_NAME#> wrapper, IService<#CLASS_NAME#> service) {
            this.wrapper = wrapper;
            this.service = service;
        }

        public SelectHolder eq(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.eq(key, value);
            return this;
        }

        public SelectHolder gt(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.ge(key, value);
            return this;
        }

        public SelectHolder lt(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.le(key, value);
            return this;
        }

        public SelectHolder ge(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.ge(key, value);
            return this;
        }

        public SelectHolder le(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.le(key, value);
            return this;
        }

        public SelectHolder like(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.like(key, value);
            return this;
        }

        public SelectHolder notLike(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.notLike(key, value);
            return this;
        }

        public SelectHolder between(SFunction<#CLASS_NAME#, ?> key, Object valueStart, Object valueEnd) {
            wrapper.between(key, valueStart, valueEnd);
            return this;
        }

        public SelectHolder notBetween(SFunction<#CLASS_NAME#, ?> key, Object valueStart, Object valueEnd) {
            wrapper.notBetween(key, valueStart, valueEnd);
            return this;
        }

        public SelectHolder in(SFunction<#CLASS_NAME#, ?> key, Object... values) {
            for (Object value : values) {
                wrapper.in(key, value);
            }
            return this;
        }

        public SelectHolder notIn(SFunction<#CLASS_NAME#, ?> key, Object... values) {
            for (Object value : values) {
                wrapper.notIn(key, value);
            }
            return this;
        }

        public SelectHolder ne(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.ne(key, value);
            return this;
        }

        public SelectHolder orderByDesc(SFunction<#CLASS_NAME#, ?> column) {
            wrapper.orderByDesc(column);
            return this;
        }

        public SelectHolder orderByAsc(SFunction<#CLASS_NAME#, ?> column) {
            wrapper.orderByAsc(column);
            return this;
        }

        public SelectHolder isNull(SFunction<#CLASS_NAME#, ?> column) {
            wrapper.isNull(column);
            return this;
        }

        public SelectHolder isNotNull(SFunction<#CLASS_NAME#, ?> column) {
            wrapper.isNotNull(column);
            return this;
        }

        public SelectHolder lastSql(String sql) {
            wrapper.last(sql);
            return this;
        }

        public SelectHolder and(Consumer<LambdaQueryWrapper<#CLASS_NAME#>> consumer) {
            wrapper.and(consumer);
            return this;
        }

        public SelectHolder or(Consumer<LambdaQueryWrapper<#CLASS_NAME#>> consumer) {
            wrapper.or(consumer);
            return this;
        }

        public long count() {
            return service.count(wrapper);
        }

        public #CLASS_NAME# first() {
            List<#CLASS_NAME#> goodsList = service.page(new Page<>(1, 1)).getRecords();
            if (!goodsList.isEmpty()) {
                return goodsList.getFirst();
            } else {
                return null;
            }
        }

        public #CLASS_NAME#.Dynamic firstDynamic() {
            #CLASS_NAME# object = first();
            if (object == null) {
                return null;
            }
            return new #CLASS_NAME#.Dynamic(object);
        }

        public #CLASS_NAME# one() {
            return service.getOne(wrapper);
        }

        public #CLASS_NAME#.Dynamic oneDynamic() {
            #CLASS_NAME# object = service.getOne(wrapper);
            if (object != null) {
                return new #CLASS_NAME#.Dynamic(object);
            }
            return null;
        }

        public List<#CLASS_NAME#> list() {
            return service.list(wrapper);
        }

        public List<#CLASS_NAME#.Dynamic> listDynamic() {
            return #CLASS_NAME#.Dynamic.ofList(service.list(wrapper));
        }

        public IPage<#CLASS_NAME#> page(Integer page, Integer dataSize) {
            return service.page(new Page<>(page, dataSize), wrapper);
        }

        public IPage<#CLASS_NAME#.Dynamic> pageDynamic(Integer page, Integer dataSize) {
            IPage<#CLASS_NAME#> pageResult = service.page(new Page<>(page, dataSize), wrapper);
            IPage<#CLASS_NAME#.Dynamic> result = new Page<>();
            result.setPages(pageResult.getPages());
            result.setCurrent(pageResult.getCurrent());
            result.setRecords(#CLASS_NAME#.Dynamic.ofList(pageResult.getRecords()));
            result.setSize(pageResult.getSize());
            result.setTotal(pageResult.getTotal());
            return result;
        }

    }

    public static class UpdateHolder {

        private final LambdaUpdateWrapper<#CLASS_NAME#> wrapper;

        private final IService<#CLASS_NAME#> service;

        public UpdateHolder(LambdaUpdateWrapper<#CLASS_NAME#> wrapper, IService<#CLASS_NAME#> service) {
            this.wrapper = wrapper;
            this.service = service;
        }

        public UpdateHolder eq(SFunction<#CLASS_NAME#, ?> column, Object value) {
            wrapper.eq(column, value);
            return this;
        }

        public UpdateHolder gt(SFunction<#CLASS_NAME#, ?> column, Object value) {
            wrapper.ge(column, value);
            return this;
        }

        public UpdateHolder lt(SFunction<#CLASS_NAME#, ?> column, Object value) {
            wrapper.le(column, value);
            return this;
        }

        public UpdateHolder ge(SFunction<#CLASS_NAME#, ?> column, Object value) {
            wrapper.ge(column, value);
            return this;
        }

        public UpdateHolder le(SFunction<#CLASS_NAME#, ?> column, Object value) {
            wrapper.le(column, value);
            return this;
        }

        public UpdateHolder like(SFunction<#CLASS_NAME#, ?> column, Object value) {
            wrapper.like(column, value);
            return this;
        }

        public UpdateHolder notLike(SFunction<#CLASS_NAME#, ?> column, Object value) {
            wrapper.notLike(column, value);
            return this;
        }

        public UpdateHolder between(SFunction<#CLASS_NAME#, ?> column, Object valueStart, Object valueEnd) {
            wrapper.between(column, valueStart, valueEnd);
            return this;
        }

        public UpdateHolder notBetween(SFunction<#CLASS_NAME#, ?> column, Object valueStart, Object valueEnd) {
            wrapper.notBetween(column, valueStart, valueEnd);
            return this;
        }

        public UpdateHolder in(SFunction<#CLASS_NAME#, ?> column, Object... values) {
            for (Object value : values) {
                wrapper.in(column, value);
            }
            return this;
        }

        public UpdateHolder notIn(SFunction<#CLASS_NAME#, ?> column, Object... values) {
            for (Object value : values) {
                wrapper.notIn(column, value);
            }
            return this;
        }

        public UpdateHolder ne(SFunction<#CLASS_NAME#, ?> column, Object value) {
            wrapper.ne(column, value);
            return this;
        }

        public UpdateHolder orderByDesc(SFunction<#CLASS_NAME#, ?> column) {
            wrapper.orderByDesc(column);
            return this;
        }

        public UpdateHolder orderByAsc(SFunction<#CLASS_NAME#, ?> column) {
            wrapper.orderByAsc(column);
            return this;
        }

        public UpdateHolder isNull(SFunction<#CLASS_NAME#, ?> column) {
            wrapper.isNull(column);
            return this;
        }

        public UpdateHolder isNotNull(SFunction<#CLASS_NAME#, ?> column) {
            wrapper.isNotNull(column);
            return this;
        }

        public UpdateHolder lastSql(String sql) {
            wrapper.last(sql);
            return this;
        }

        public UpdateHolder and(Consumer<LambdaUpdateWrapper<#CLASS_NAME#>> consumer) {
            wrapper.and(consumer);
            return this;
        }

        public UpdateHolder or(Consumer<LambdaUpdateWrapper<#CLASS_NAME#>> consumer) {
            wrapper.or(consumer);
            return this;
        }

        public UpdateHolder set(SFunction<#CLASS_NAME#, ?> column, Object value) {
            wrapper.set(column, value);
            return this;
        }

        public boolean exec() {
            return service.update(wrapper);
        }

    }

    public static class RemoveHolder {

        private final LambdaQueryWrapper<#CLASS_NAME#> wrapper;

        private final IService<#CLASS_NAME#> service;

        public RemoveHolder(LambdaQueryWrapper<#CLASS_NAME#> wrapper, IService<#CLASS_NAME#> service) {
            this.wrapper = wrapper;
            this.service = service;
        }

        public RemoveHolder eq(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.eq(key, value);
            return this;
        }

        public RemoveHolder gt(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.ge(key, value);
            return this;
        }

        public RemoveHolder lt(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.le(key, value);
            return this;
        }

        public RemoveHolder ge(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.ge(key, value);
            return this;
        }

        public RemoveHolder le(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.le(key, value);
            return this;
        }

        public RemoveHolder like(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.like(key, value);
            return this;
        }

        public RemoveHolder notLike(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.notLike(key, value);
            return this;
        }

        public RemoveHolder between(SFunction<#CLASS_NAME#, ?> key, Object valueStart, Object valueEnd) {
            wrapper.between(key, valueStart, valueEnd);
            return this;
        }

        public RemoveHolder notBetween(SFunction<#CLASS_NAME#, ?> key, Object valueStart, Object valueEnd) {
            wrapper.notBetween(key, valueStart, valueEnd);
            return this;
        }

        public RemoveHolder in(SFunction<#CLASS_NAME#, ?> key, Object... values) {
            for (Object value : values) {
                wrapper.in(key, value);
            }
            return this;
        }

        public RemoveHolder notIn(SFunction<#CLASS_NAME#, ?> key, Object... values) {
            for (Object value : values) {
                wrapper.notIn(key, value);
            }
            return this;
        }

        public RemoveHolder ne(SFunction<#CLASS_NAME#, ?> key, Object value) {
            wrapper.ne(key, value);
            return this;
        }

        public RemoveHolder orderByDesc(SFunction<#CLASS_NAME#, ?> column) {
            wrapper.orderByDesc(column);
            return this;
        }

        public RemoveHolder orderByAsc(SFunction<#CLASS_NAME#, ?> column) {
            wrapper.orderByAsc(column);
            return this;
        }

        public RemoveHolder isNull(SFunction<#CLASS_NAME#, ?> column) {
            wrapper.isNull(column);
            return this;
        }

        public RemoveHolder isNotNull(SFunction<#CLASS_NAME#, ?> column) {
            wrapper.isNotNull(column);
            return this;
        }

        public RemoveHolder lastSql(String sql) {
            wrapper.last(sql);
            return this;
        }

        public RemoveHolder and(Consumer<LambdaQueryWrapper<#CLASS_NAME#>> consumer) {
            wrapper.and(consumer);
            return this;
        }

        public RemoveHolder or(Consumer<LambdaQueryWrapper<#CLASS_NAME#>> consumer) {
            wrapper.or(consumer);
            return this;
        }

        public boolean exec() {
            return service.remove(wrapper);
        }

    }

}`;