import { useState, useCallback } from 'react';
import type { Tool, NewTool } from '../types/index.js';
import { supabase } from '../utils/supabase';

export const useTools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  const fetchTools = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) {
        console.error('Error fetching tools:', error);
        throw new Error('도구 목록을 불러오는 중 오류가 발생했습니다.');
      }
      
      const toolsData = (data || []) as unknown as Tool[];
      setTools(toolsData);
      return { success: true, data: toolsData };
    } catch (error) {
      console.error('Fetch tools error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '도구 목록을 불러오는 중 오류가 발생했습니다.' 
      };
    }
  }, []);

  const addTool = useCallback(async (newTool: NewTool) => {
    try {
      const maxOrderIndex = tools.length > 0 ? Math.max(...tools.map(t => t.order_index)) : -1;
      const toolWithOrder = { ...newTool, order_index: maxOrderIndex + 1, is_hidden: false };
      
      const { data, error } = await supabase
        .from('tools')
        .insert([toolWithOrder])
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      const newToolData = data[0] as unknown as Tool;
      setTools(prev => [...prev, newToolData]);
      return { success: true, data: newToolData };
    } catch (error) {
      console.error('Add tool error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '도구 추가 중 오류가 발생했습니다.' 
      };
    }
  }, [tools]);

  const updateTool = useCallback(async (id: string, updates: Partial<Tool>) => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      const updatedToolData = data[0] as unknown as Tool;
      setTools(prev => prev.map(tool => tool.id === id ? updatedToolData : tool));
      return { success: true, data: updatedToolData };
    } catch (error) {
      console.error('Update tool error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '도구 수정 중 오류가 발생했습니다.' 
      };
    }
  }, []);

  const deleteTool = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setTools(prev => prev.filter(tool => tool.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Delete tool error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '도구 삭제 중 오류가 발생했습니다.' 
      };
    }
  }, []);

  const toggleToolVisibility = useCallback(async (id: string, currentHidden: boolean) => {
    try {
      const { error } = await supabase
        .from('tools')
        .update({ is_hidden: !currentHidden })
        .eq('id', id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setTools(prev => prev.map(tool => 
        tool.id === id ? { ...tool, is_hidden: !currentHidden } : tool
      ));
      return { success: true };
    } catch (error) {
      console.error('Toggle visibility error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '가시성 변경 중 오류가 발생했습니다.' 
      };
    }
  }, []);

  const reorderTools = useCallback(async (newTools: Tool[]) => {
    setIsReordering(true);
    try {
      // 원래 배열 순서를 유지하면서 유효한 도구만 필터링
      const validTools = newTools.filter(tool => tool && tool.id);
      
      // newTools에 유효한 도구가 없으면 원래 배열 사용
      if (validTools.length === 0) {
        setTools(tools);
        return { success: true };
      }
      
      // 병렬 처리를 위한 Promise.all 사용
      const updatePromises = validTools.map((tool, index) => 
        supabase
          .from('tools')
          .update({ order_index: index })
          .eq('id', tool.id)
      );

      const results = await Promise.all(updatePromises);
      
      // 모든 업데이트가 성공했는지 확인
      const hasError = results.some(result => result.error);
      if (hasError) {
        const errorResult = results.find(result => result.error);
        throw new Error(`Error updating tool order: ${errorResult?.error?.message}`);
      }
      
      // 원래 배열 순서를 유지하여 상태 업데이트
      setTools(newTools);
      return { success: true };
    } catch (error) {
      console.error('Reorder tools error:', error);
      // 오류 시 원래 순서로 복원
      await fetchTools();
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '순서 변경 중 오류가 발생했습니다.' 
      };
    } finally {
      setIsReordering(false);
    }
  }, [fetchTools, tools]);

  return {
    tools,
    isReordering,
    fetchTools,
    addTool,
    updateTool,
    deleteTool,
    toggleToolVisibility,
    reorderTools
  };
}; 