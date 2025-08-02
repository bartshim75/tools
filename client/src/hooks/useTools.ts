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
      
      setTools(data || []);
      return { success: true, data: data || [] };
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
      
      setTools(prev => [...prev, data[0]]);
      return { success: true, data: data[0] };
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
      
      setTools(prev => prev.map(tool => tool.id === id ? data[0] : tool));
      return { success: true, data: data[0] };
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
      // 단일 도구씩 순차적으로 업데이트
      for (let i = 0; i < newTools.length; i++) {
        const tool = newTools[i];
        const { error } = await supabase
          .from('tools')
          .update({ order_index: i })
          .eq('id', tool.id);
        
        if (error) {
          throw new Error(`Error updating tool ${tool.name}: ${error.message}`);
        }
      }
      
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
  }, [fetchTools]);

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