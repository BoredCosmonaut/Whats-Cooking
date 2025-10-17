<script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { useRecipe } from '@/composables/useRecipe';

    const{submitRecipe,error} = useRecipe()
    const router = useRouter();
</script>